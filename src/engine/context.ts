import { syncReduce } from './syncReduce'

/** Days per month (index 0 unused, 1=Jan..12=Dec). Feb always 28 in this system. */
const DAYS_PER_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/** Cumulated days per month for kin computation (index 0 unused). */
export const CUMULATED_DAYS_PER_MONTH = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]

/**
 * Calendar context: tracks Gregorian date, kin, moon, and day of moon.
 * Supports forward/backward iteration for heptad/moon/year calculations.
 * Port of www/application/models/context.php
 */
export class Context {
  gregorianYear: number
  gregorianMonth: number
  gregorianDay: number
  kin: number
  moon: number
  dayOfMoon: number
  newSiriusDate: string | null = null
  newSiriusCentury: number | null = null
  newSiriusYear: number | null = null

  constructor(
    gregorianDay: number,
    gregorianMonth: number,
    gregorianYear: number,
    kin: number,
    moon: number,
    dayOfMoon: number,
  ) {
    this.gregorianDay = gregorianDay
    this.gregorianMonth = gregorianMonth
    this.gregorianYear = gregorianYear
    this.kin = kin
    this.moon = moon
    this.dayOfMoon = dayOfMoon
    this.computeNewSiriusDate()
  }

  /** Clone this context */
  clone(): Context {
    return new Context(
      this.gregorianDay,
      this.gregorianMonth,
      this.gregorianYear,
      this.kin,
      this.moon,
      this.dayOfMoon,
    )
  }

  /** Advance by one day */
  plusOne(): this {
    // Gregorian year rollover
    if (this.gregorianMonth === 12 && this.gregorianDay === 31) {
      this.gregorianYear += 1
    }

    // Gregorian day/month advance
    if (this.gregorianDay === DAYS_PER_MONTH[this.gregorianMonth]) {
      this.gregorianMonth = syncReduce(12, this.gregorianMonth + 1)
      this.gregorianDay = 1
    } else {
      this.gregorianDay += 1
    }

    // Day Out Of Time: after moon 13 day 28, skip to July 26
    if (this.moon === 13 && this.dayOfMoon === 28) {
      this.gregorianDay = 26 // July 25 = Day Out Of Time
    }

    // Kin advances
    this.kin = syncReduce(260, this.kin + 1)

    // Moon/day_of_moon advance
    if (this.dayOfMoon === 28) {
      this.moon = syncReduce(13, this.moon + 1)
      this.dayOfMoon = 1
    } else {
      this.dayOfMoon += 1
    }

    this.computeNewSiriusDate()
    return this
  }

  /** Go back one day */
  minusOne(): this {
    // Gregorian year rollover
    if (this.gregorianMonth === 1 && this.gregorianDay === 1) {
      this.gregorianYear -= 1
    }

    // Gregorian day/month retreat
    if (this.gregorianDay === 1) {
      this.gregorianMonth = syncReduce(12, this.gregorianMonth - 1)
      this.gregorianDay = DAYS_PER_MONTH[this.gregorianMonth]
    } else {
      this.gregorianDay -= 1
    }

    // Kin retreats
    this.kin = syncReduce(260, this.kin - 1)

    // Day Out Of Time going backwards
    if (this.moon === 1 && this.dayOfMoon === 1) {
      this.gregorianDay = 24 // Before July 25
    }

    // Moon/day_of_moon retreat
    if (this.dayOfMoon === 1) {
      this.moon = syncReduce(13, this.moon - 1)
      this.dayOfMoon = 28
    } else {
      this.dayOfMoon -= 1
    }

    this.computeNewSiriusDate()
    return this
  }

  private computeNewSiriusDate(): void {
    const { gregorianYear: y, gregorianMonth: m, gregorianDay: d } = this

    if (y > 1987 || (y === 1987 && m > 8) || (y === 1987 && m === 7 && d > 25)) {
      const yearLapse = y - 1987
      let nsYear = syncReduce(52, yearLapse)
      if (m < 7 || (m === 7 && d < 26)) {
        nsYear = syncReduce(52, yearLapse) - 1
      }
      const nsCentury = Math.ceil(yearLapse / 52)
      this.newSiriusCentury = nsCentury
      this.newSiriusYear = nsYear
      this.newSiriusDate = `${nsCentury}.${nsYear}.${this.moon}.${this.dayOfMoon}`
    } else {
      this.newSiriusDate = null
      this.newSiriusCentury = null
      this.newSiriusYear = null
    }
  }
}
