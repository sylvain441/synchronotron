import { computeMoon } from './moonCalculator'
import type { Context } from './context'
import type { KinResult } from './types'

/**
 * Compute a full 13-moon year (364 days).
 * Port of Year_numbers from www/application/models/numbers/year_numbers.php
 *
 * @param context - Context positioned at day 1 of the year (July 26)
 * @param selectedDayOfMoon - The day_of_moon to mark as selected
 */
export function computeYear(
  context: Context,
  selectedDayOfMoon?: number,
): KinResult[][][] {
  const moons: KinResult[][][] = []

  for (let m = 0; m < 13; m++) {
    const moon = computeMoon(context, selectedDayOfMoon)
    moons.push(moon)

    // Advance context to next day
    if (m < 12) {
      context.plusOne()
    }
  }

  return moons
}
