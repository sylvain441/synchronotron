import type { GridCell } from './data'

export type DateMode = 'gregorian' | '13moon' | 'natural'

/** Result of a grid cell lookup with computed total */
export interface GridCellResult {
  v: number
  h: number
  baseUnit: number
  timeUnit: number
  spaceUnit: number
  syncUnit: number
  /** timeUnit + spaceUnit + syncUnit */
  total: number
}

/** Computed result for a single kin/day */
export interface KinResult {
  // Heptad & plasma
  heptad: number
  plasma: number
  dayOfMoon: number
  moon: number

  // Gregorian
  gregorianYear: number
  gregorianMonth: number
  gregorianDay: number
  gregorianDateString: string

  // New Sirius
  newSiriusDate: string | null
  newSiriusCentury: number | null
  newSiriusYear: number | null

  // Kin
  kin: number
  kinTone: number
  kinGlyph: number
  kinColor: number
  kinToneName: string
  kinGlyphName: string

  // BMUs
  plasmaBmu: number
  kinBmu: number
  kinAnalogBmu: number
  kinGuideBmu: number
  kinAntipodBmu: number
  kinOccultBmu: number

  // TFI Hunab Ku-21
  tfiHunabKuTotal: number
  tfiHunabKuBmu: number
  cumulativeTfiHunabKuTotal: number
  cumulativeTfiHunabKuBmu: number

  // Grid cells (time, space, sync dimensions)
  timeCell: GridCellResult
  spaceCell: GridCellResult
  syncCell: GridCellResult

  // TFI MCF
  tfiMcfTotal: number
  tfiMcfBmu: number
  cumulativeTfiMcfTotal: number
  cumulativeTfiMcfBmu: number

  // Equivalent Kin
  equivalentKin: number
  equivalentKinV: number
  equivalentKinH: number
  cumulativeEquivalentKin: number
  cumulativeEquivalentKinV: number
  cumulativeEquivalentKinH: number

  // Psi Chrono
  psiChronoUnit: number
  psiChronoUnitBmu: number
  psiChronoUnitV: number
  psiChronoUnitH: number

  // Heptad BMUs (tollan from/to)
  heptadFromBmu: number
  heptadToBmu: number

  // Reciprocals
  reciprocalInterval: number
  reciprocalSum: number
  reciprocalComposite: number

  // I Ching
  iChing: number

  // Selection flag (used in heptad view)
  selected: boolean
}

/** Highlighted cell on the SVG grid */
export interface HighlightedCell {
  v: number
  h: number
  dimension: 'time' | 'space' | 'sync' | 'tfiHunabKu' | 'tfiMcf' | 'equivalentKin' | 'psiChrono'
  label?: string
  value?: number
}

/** Connection line between two highlighted cells */
export interface GridConnection {
  from: { v: number; h: number }
  to: { v: number; h: number }
  type: 'horizontal' | 'vertical' | 'diagonal'
  dimensions: string
}

export type ViewMode = 'kin' | 'heptad' | 'moon' | 'year'
