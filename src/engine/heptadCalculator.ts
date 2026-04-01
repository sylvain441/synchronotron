import { syncReduce } from './syncReduce'
import { lookupGridByBaseUnit, lookupGridBySyncUnit } from './lookup'
import { computeKin } from './kinCalculator'
import type { Context } from './context'
import type { KinResult } from './types'

/**
 * Compute a 7-day heptad with cumulative values.
 * Port of Heptad_numbers from www/application/models/numbers/heptad_numbers.php
 *
 * @param context - Context positioned at the first day (Dali) of the heptad
 * @param selectedDayOfMoon - The day_of_moon to mark as selected (optional)
 */
export function computeHeptad(
  context: Context,
  selectedDayOfMoon?: number,
): KinResult[] {
  const results: KinResult[] = []
  let cumulativeTfiHunabKuTotal = 0
  let cumulativeTfiMcfTotal = 0

  for (let i = 0; i < 7; i++) {
    const isSelected = selectedDayOfMoon !== undefined && context.dayOfMoon === selectedDayOfMoon
    const kin = computeKin(context, isSelected)

    // Accumulate
    cumulativeTfiHunabKuTotal += kin.tfiHunabKuTotal
    cumulativeTfiMcfTotal += kin.tfiMcfTotal

    // Set cumulative values
    kin.cumulativeTfiHunabKuTotal = cumulativeTfiHunabKuTotal
    kin.cumulativeTfiHunabKuBmu = syncReduce(441, cumulativeTfiHunabKuTotal)
    kin.cumulativeTfiMcfTotal = cumulativeTfiMcfTotal
    kin.cumulativeTfiMcfBmu = syncReduce(441, cumulativeTfiMcfTotal)

    const cumulativeEquivalentKin = syncReduce(260, cumulativeTfiMcfTotal)
    kin.cumulativeEquivalentKin = cumulativeEquivalentKin
    try {
      const eqCell = lookupGridBySyncUnit(cumulativeEquivalentKin)
      kin.cumulativeEquivalentKinV = eqCell.v
      kin.cumulativeEquivalentKinH = eqCell.h
    } catch {
      kin.cumulativeEquivalentKinV = 0
      kin.cumulativeEquivalentKinH = 0
    }

    results.push(kin)

    if (i < 6) {
      context.plusOne()
    }
  }

  return results
}
