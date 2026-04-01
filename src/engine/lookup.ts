import {
  grid, tzolkin, yearDays, tones, glyphs, colors, daysOfMoon,
  plasmas, reciprocals, references, tollan,
  type GridCell, type TzolkinKin, type YearDay, type Tone,
  type Glyph, type Color, type DayOfMoon, type Plasma,
  type Reciprocal, type YearReference, type TollanEntry,
} from './data'
import type { GridCellResult } from './types'

// --- Grid indexes ---

const gridByCoords = new Map<string, GridCell>()
const gridByBaseUnit = new Map<number, GridCell>()
const gridBySpaceUnit = new Map<number, GridCell>()
const gridBySyncUnit = new Map<number, GridCell>() // filtered v ∈ [5,17]

for (const cell of grid) {
  gridByCoords.set(`${cell.v},${cell.h}`, cell)
  gridByBaseUnit.set(cell.baseUnit, cell)
  gridBySpaceUnit.set(cell.spaceUnit, cell)
  // Sync unit lookup is restricted to v ∈ [5,17] (inner 13-row band)
  // per www/application/models/ORM/cell.php:30
  if (cell.v >= 5 && cell.v <= 17 && cell.syncUnit > 0) {
    gridBySyncUnit.set(cell.syncUnit, cell)
  }
}

// --- Other indexes ---

const tzolkinById = new Map<number, TzolkinKin>()
for (const kin of tzolkin) tzolkinById.set(kin.id, kin)

const yearDayByGregorian = new Map<string, YearDay>()
const yearDayByMoon = new Map<string, YearDay>()
for (const day of yearDays) {
  yearDayByGregorian.set(`${day.gregorianMonth},${day.gregorianDay}`, day)
  yearDayByMoon.set(`${day.moonId},${day.dayOfMoonId}`, day)
}

const toneById = new Map<number, Tone>()
for (const tone of tones) toneById.set(tone.id, tone)

const glyphById = new Map<number, Glyph>()
for (const glyph of glyphs) glyphById.set(glyph.id, glyph)

const colorById = new Map<number, Color>()
for (const color of colors) colorById.set(color.id, color)

const dayOfMoonById = new Map<number, DayOfMoon>()
for (const dom of daysOfMoon) dayOfMoonById.set(dom.id, dom)

const plasmaById = new Map<number, Plasma>()
for (const plasma of plasmas) plasmaById.set(plasma.id, plasma)

const reciprocalByTonePlasma = new Map<string, Reciprocal>()
for (const r of reciprocals) reciprocalByTonePlasma.set(`${r.toneId},${r.plasmaId}`, r)

const referenceById = new Map<number, YearReference>()
for (const ref of references) referenceById.set(ref.id, ref)

const tollanById = new Map<number, TollanEntry>()
for (const t of tollan) tollanById.set(t.id, t)

// --- Public lookup functions ---

function toGridCellResult(cell: GridCell): GridCellResult {
  return {
    v: cell.v,
    h: cell.h,
    baseUnit: cell.baseUnit,
    timeUnit: cell.timeUnit,
    spaceUnit: cell.spaceUnit,
    syncUnit: cell.syncUnit,
    total: cell.timeUnit + cell.spaceUnit + cell.syncUnit,
  }
}

export function lookupGridByCoords(v: number, h: number): GridCellResult {
  const cell = gridByCoords.get(`${v},${h}`)
  if (!cell) throw new Error(`Grid cell not found at (${v}, ${h})`)
  return toGridCellResult(cell)
}

export function lookupGridByBaseUnit(baseUnit: number): GridCellResult {
  const cell = gridByBaseUnit.get(baseUnit)
  if (!cell) throw new Error(`Grid cell not found for baseUnit ${baseUnit}`)
  return toGridCellResult(cell)
}

export function lookupGridBySpaceUnit(spaceUnit: number): GridCellResult {
  const cell = gridBySpaceUnit.get(spaceUnit)
  if (!cell) throw new Error(`Grid cell not found for spaceUnit ${spaceUnit}`)
  return toGridCellResult(cell)
}

export function lookupGridBySyncUnit(syncUnit: number): GridCellResult {
  const cell = gridBySyncUnit.get(syncUnit)
  if (!cell) throw new Error(`Grid cell not found for syncUnit ${syncUnit} (v ∈ [5,17])`)
  return toGridCellResult(cell)
}

export function lookupTzolkin(id: number): TzolkinKin {
  const kin = tzolkinById.get(id)
  if (!kin) throw new Error(`Tzolkin kin not found: ${id}`)
  return kin
}

export function lookupYearDay(gregorianMonth: number, gregorianDay: number): YearDay {
  const day = yearDayByGregorian.get(`${gregorianMonth},${gregorianDay}`)
  if (!day) throw new Error(`Year day not found for ${gregorianMonth}/${gregorianDay}`)
  return day
}

export function lookupYearDayByMoon(moon: number, dayOfMoon: number): YearDay {
  const day = yearDayByMoon.get(`${moon},${dayOfMoon}`)
  if (!day) throw new Error(`Year day not found for moon ${moon}, day ${dayOfMoon}`)
  return day
}

export function lookupTone(id: number): Tone {
  const tone = toneById.get(id)
  if (!tone) throw new Error(`Tone not found: ${id}`)
  return tone
}

export function lookupGlyph(id: number): Glyph {
  const glyph = glyphById.get(id)
  if (!glyph) throw new Error(`Glyph not found: ${id}`)
  return glyph
}

export function lookupColor(id: number): Color {
  const color = colorById.get(id)
  if (!color) throw new Error(`Color not found: ${id}`)
  return color
}

export function lookupDayOfMoon(id: number): DayOfMoon {
  const dom = dayOfMoonById.get(id)
  if (!dom) throw new Error(`Day of moon not found: ${id}`)
  return dom
}

export function lookupPlasma(id: number): Plasma {
  const plasma = plasmaById.get(id)
  if (!plasma) throw new Error(`Plasma not found: ${id}`)
  return plasma
}

export function lookupReciprocal(toneId: number, plasmaId: number): Reciprocal {
  const r = reciprocalByTonePlasma.get(`${toneId},${plasmaId}`)
  if (!r) throw new Error(`Reciprocal not found for tone ${toneId}, plasma ${plasmaId}`)
  return r
}

export function lookupReference(id: number): YearReference {
  const ref = referenceById.get(id)
  if (!ref) throw new Error(`Reference not found: ${id}`)
  return ref
}

export function lookupTollan(id: number): TollanEntry {
  const t = tollanById.get(id)
  if (!t) throw new Error(`Tollan entry not found: ${id}`)
  return t
}

/** Get the full grid data for SVG rendering */
export function getAllGridCells(): GridCell[] {
  return grid
}
