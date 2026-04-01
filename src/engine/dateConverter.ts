import { syncReduce } from './syncReduce'
import { lookupReference, lookupYearDay } from './lookup'
import { Context, CUMULATED_DAYS_PER_MONTH } from './context'

const DAYS_PER_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export class DateValidationError extends Error {
  constructor(message: string, public redirectDate?: { year: number; month: number; day: number }) {
    super(message)
    this.name = 'DateValidationError'
  }
}

/**
 * Convert a Gregorian date to a synchronotron Context.
 * Port of Date_calculator::initialize_gregorian from
 * www/application/models/date_calculator.php:25-61
 */
export function gregorianToContext(year: number, month: number, day: number): Context {
  // Validate inputs
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw new DateValidationError('Invalid date values')
  }

  year = Math.floor(year)
  month = Math.floor(month)
  day = Math.floor(day)

  // Feb 29 not supported
  if (month === 2 && day === 29) {
    throw new DateValidationError('February 29 is not part of the 13-moon calendar', { year, month: 2, day: 28 })
  }

  // Constrain month and day
  month = Math.min(Math.max(month, 1), 12)
  day = Math.min(Math.max(day, 1), DAYS_PER_MONTH[month])

  // Before Gregorian reform (Oct 4, 1582)
  if (year < 1582 || (year === 1582 && month < 10) || (year === 1582 && month === 10 && day < 4)) {
    throw new DateValidationError('Dates before October 4, 1582 are not supported', { year: 1582, month: 10, day: 4 })
  }

  // Day Out Of Time (July 25)
  if (month === 7 && day === 25) {
    throw new DateValidationError('July 25 is the Day Out Of Time', { year, month: 7, day: 26 })
  }

  // Compute reference year and kin
  // 2012 reference = id 1, so year - 2011
  const referenceYear = syncReduce(52, year - 2011)
  const ref = lookupReference(referenceYear)
  const kinId = syncReduce(260, ref.firstOfJanuary + CUMULATED_DAYS_PER_MONTH[month] + day - 1)

  // Look up the day in the year table (maps gregorian month/day to moon/dayOfMoon)
  const yearDay = lookupYearDay(month, day)

  return new Context(
    day,
    month,
    year,
    kinId,
    yearDay.moonId,     // moon (1-13)
    yearDay.dayOfMoonId, // dayOfMoon (1-28)
  )
}

/**
 * Get the context positioned at the start of the heptad containing the given date.
 */
export function heptadContext(year: number, month: number, day: number): Context {
  const ctx = gregorianToContext(year, month, day)
  const yearDay = lookupYearDay(month, day)
  const daliDayOfMoon = Math.floor((yearDay.dayOfMoonId - 1) / 7) * 7 + 1
  const difference = yearDay.dayOfMoonId - daliDayOfMoon
  for (let i = 0; i < difference; i++) {
    ctx.minusOne()
  }
  return ctx
}

/**
 * Get the context positioned at the start of the moon containing the given date.
 */
export function moonContext(year: number, month: number, day: number): Context {
  const ctx = gregorianToContext(year, month, day)
  const yearDay = lookupYearDay(month, day)
  for (let i = 0; i < yearDay.dayOfMoonId - 1; i++) {
    ctx.minusOne()
  }
  return ctx
}

/**
 * Get the context positioned at the start of the year containing the given date.
 * The 13-moon year starts on July 26.
 */
export function yearContext(year: number, month: number, day: number): Context {
  const ctx = gregorianToContext(year, month, day)
  const yearDay = lookupYearDay(month, day)
  // day_of_year = (moon - 1) * 28 + dayOfMoon
  const dayOfYear = (yearDay.moonId - 1) * 28 + yearDay.dayOfMoonId
  for (let i = 0; i < dayOfYear - 1; i++) {
    ctx.minusOne()
  }
  return ctx
}
