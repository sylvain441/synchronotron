import { syncReduce } from './syncReduce'
import {
  lookupTzolkin, lookupYearDay, lookupGlyph, lookupTone,
  lookupDayOfMoon, lookupPlasma, lookupReciprocal,
  lookupGridByCoords, lookupGridBySpaceUnit, lookupGridBySyncUnit,
  lookupGridByBaseUnit, lookupTollan,
} from './lookup'
import type { Context } from './context'
import type { KinResult, GridCellResult } from './types'

/**
 * Compute all fields for a single kin/day.
 * Port of Kin_numbers::compute_numbers from
 * www/application/models/numbers/kin_numbers.php:34-166
 */
export function computeKin(context: Context, selected: boolean = false): KinResult {
  // Lookup kin in tzolkin (260-day cycle)
  const tzKin = lookupTzolkin(context.kin)
  const tone = lookupTone(tzKin.toneId)
  const glyph = lookupGlyph(tzKin.glyphId)

  // Lookup day in year table (gregorian → moon/dayOfMoon mapping)
  const yearDay = lookupYearDay(context.gregorianMonth, context.gregorianDay)
  const dayOfMoon = lookupDayOfMoon(yearDay.dayOfMoonId)
  const plasma = lookupPlasma(dayOfMoon.plasmaId)

  // Kin relationships BMUs
  const kinBmu = glyph.bmu
  const analogGlyph = lookupGlyph(lookupTzolkin(tzKin.analogKin).glyphId)
  const guideGlyph = lookupGlyph(lookupTzolkin(tzKin.guideKin).glyphId)
  const antipodGlyph = lookupGlyph(lookupTzolkin(tzKin.antipodKin).glyphId)
  const occultGlyph = lookupGlyph(lookupTzolkin(tzKin.occultKin).glyphId)

  // TFI Hunab Ku-21: sum of all BMUs
  const tfiHunabKuTotal = plasma.bmu + kinBmu + analogGlyph.bmu + guideGlyph.bmu + antipodGlyph.bmu + occultGlyph.bmu
  const tfiHunabKuBmu = syncReduce(441, tfiHunabKuTotal)
  const tfiHunabKuCell = lookupGridByBaseUnit(tfiHunabKuBmu)

  // Grid cell lookups for time, space, sync dimensions
  const timeCell = lookupGridByCoords(yearDay.v, yearDay.h)
  const spaceCell = lookupGridBySpaceUnit(tzKin.id)
  const syncCell = lookupGridBySyncUnit(tzKin.id)

  // TFI MCF (Master Coordinating Frequency)
  const tfiMcfTotal = timeCell.total + spaceCell.total + syncCell.total
  const tfiMcfBmu = syncReduce(441, tfiMcfTotal)
  const tfiMcfCell = lookupGridByBaseUnit(tfiMcfBmu)

  // Equivalent Kin
  const equivalentKinId = syncReduce(260, tfiMcfTotal)
  const equivalentKinTz = lookupTzolkin(equivalentKinId)
  // Equivalent kin's cell (using the kin's position in the grid)
  let equivalentKinV = 0
  let equivalentKinH = 0
  try {
    const eqCell = lookupGridBySyncUnit(equivalentKinId)
    equivalentKinV = eqCell.v
    equivalentKinH = eqCell.h
  } catch {
    // Some kins may not have a sync unit mapping
  }

  // Heptad (which 7-day period)
  const heptadId = Math.floor((yearDay.dayOfMoonId - 1) / 7) + (yearDay.moonId - 1) * 4 + 1
  const tollanEntry = lookupTollan(heptadId)
  const heptadFromGlyph = lookupGlyph(tollanEntry.fromId)
  const heptadToGlyph = lookupGlyph(tollanEntry.toId)

  // Reciprocals
  const reciprocal = lookupReciprocal(tzKin.toneId, dayOfMoon.plasmaId)

  // Psi Chrono Unit
  const psiChronoCell = lookupGridBySyncUnit(yearDay.psiChronoUnit)

  // Gregorian date string
  const dt = new Date(context.gregorianYear, context.gregorianMonth - 1, context.gregorianDay)
  const gregorianDateString = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  // Color
  const kinColor = glyph.colorId ?? 0

  return {
    heptad: heptadId,
    plasma: plasma.id,
    dayOfMoon: dayOfMoon.id,
    moon: yearDay.moonId,

    gregorianYear: context.gregorianYear,
    gregorianMonth: context.gregorianMonth,
    gregorianDay: context.gregorianDay,
    gregorianDateString,

    newSiriusDate: context.newSiriusDate,
    newSiriusCentury: context.newSiriusCentury,
    newSiriusYear: context.newSiriusYear,

    kin: tzKin.id,
    kinTone: tzKin.toneId,
    kinGlyph: tzKin.glyphId,
    kinColor,
    kinToneName: tone.name,
    kinGlyphName: glyph.name,

    plasmaBmu: plasma.bmu,
    kinBmu,
    kinAnalogBmu: analogGlyph.bmu,
    kinGuideBmu: guideGlyph.bmu,
    kinAntipodBmu: antipodGlyph.bmu,
    kinOccultBmu: occultGlyph.bmu,

    tfiHunabKuTotal,
    tfiHunabKuBmu,
    cumulativeTfiHunabKuTotal: 0, // Set by heptad calculator
    cumulativeTfiHunabKuBmu: 0,

    timeCell,
    spaceCell,
    syncCell,

    tfiMcfTotal,
    tfiMcfBmu,
    cumulativeTfiMcfTotal: 0,
    cumulativeTfiMcfBmu: 0,

    equivalentKin: equivalentKinId,
    equivalentKinV,
    equivalentKinH,
    cumulativeEquivalentKin: 0,
    cumulativeEquivalentKinV: 0,
    cumulativeEquivalentKinH: 0,

    psiChronoUnit: yearDay.psiChronoUnit,
    psiChronoUnitBmu: psiChronoCell.baseUnit,
    psiChronoUnitV: psiChronoCell.v,
    psiChronoUnitH: psiChronoCell.h,

    heptadFromBmu: heptadFromGlyph.bmu,
    heptadToBmu: heptadToGlyph.bmu,

    reciprocalInterval: reciprocal.interval,
    reciprocalSum: reciprocal.sum,
    reciprocalComposite: reciprocal.composite,

    iChing: dayOfMoon.iChing,

    selected,
  }
}
