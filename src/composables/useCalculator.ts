import { ref, watch, shallowRef } from 'vue'
import {
  gregorianToContext,
  DateValidationError,
} from '../engine/dateConverter'
import { computeKin } from '../engine/kinCalculator'
import { lookupYearDayByMoon } from '../engine/lookup'
import type { KinResult } from '../engine/types'

export function useCalculator() {
  const today = new Date()
  let initDay = today.getDate()
  let initMonth = today.getMonth() + 1
  if (initMonth === 7 && initDay === 25) initDay = 26
  if (initMonth === 2 && initDay === 29) initDay = 28

  const year = ref(today.getFullYear())
  const month = ref(initMonth)
  const day = ref(initDay)
  const error = ref<string | null>(null)

  const kinResult = shallowRef<KinResult | null>(null)

  function calculate() {
    error.value = null
    try {
      const ctx = gregorianToContext(year.value, month.value, day.value)
      kinResult.value = computeKin(ctx)
    } catch (e) {
      if (e instanceof DateValidationError) {
        error.value = e.message
        if (e.redirectDate) {
          year.value = e.redirectDate.year
          month.value = e.redirectDate.month
          day.value = e.redirectDate.day
        }
      } else {
        error.value = `Calculation error: ${e}`
      }
    }
  }

  calculate()
  watch([year, month, day], calculate)

  function setDate(y: number, m: number, d: number) {
    year.value = y
    month.value = m
    day.value = d
  }

  function setToday() {
    const now = new Date()
    let d = now.getDate()
    let m = now.getMonth() + 1
    if (m === 7 && d === 25) d = 26
    if (m === 2 && d === 29) d = 28
    setDate(now.getFullYear(), m, d)
  }

  function setMoonDate(moon: number, dayOfMoon: number) {
    try {
      const yd = lookupYearDayByMoon(moon, dayOfMoon)
      // Keep the current gregorian year but set the month/day from the 13-moon mapping
      month.value = yd.gregorianMonth
      day.value = yd.gregorianDay
    } catch {
      error.value = `Invalid 13-moon date: Moon ${moon}, Day ${dayOfMoon}`
    }
  }

  const DAYS_PER_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  function nextDay() {
    let y = year.value, m = month.value, d = day.value
    d++
    if (d > DAYS_PER_MONTH[m]) { d = 1; m++ }
    if (m > 12) { m = 1; y++ }
    if (m === 2 && d === 29) { d = 1; m = 3 }
    if (m === 7 && d === 25) d = 26
    setDate(y, m, d)
  }

  function prevDay() {
    let y = year.value, m = month.value, d = day.value
    d--
    if (d < 1) { m--; if (m < 1) { m = 12; y-- } d = DAYS_PER_MONTH[m] }
    if (m === 2 && d === 29) d = 28
    if (m === 7 && d === 25) d = 24
    setDate(y, m, d)
  }

  return {
    year,
    month,
    day,
    error,
    kinResult,
    calculate,
    setDate,
    setToday,
    setMoonDate,
    nextDay,
    prevDay,
  }
}
