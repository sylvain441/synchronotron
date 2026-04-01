import { computeHeptad } from './heptadCalculator'
import type { Context } from './context'
import type { KinResult } from './types'

/**
 * Compute a 28-day moon (4 heptads).
 * Port of Moon_numbers from www/application/models/numbers/moon_numbers.php
 *
 * @param context - Context positioned at day 1 of the moon
 * @param selectedDayOfMoon - The day_of_moon to mark as selected
 */
export function computeMoon(
  context: Context,
  selectedDayOfMoon?: number,
): KinResult[][] {
  const heptads: KinResult[][] = []

  for (let h = 0; h < 4; h++) {
    const heptad = computeHeptad(context, selectedDayOfMoon)
    heptads.push(heptad)

    // Advance context to next day (it's already at the last day of the heptad)
    if (h < 3) {
      context.plusOne()
    }
  }

  return heptads
}
