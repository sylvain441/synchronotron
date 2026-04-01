/**
 * Verify engine calculations against known CSV output.
 * Run: npx tsx scripts/verify.ts
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { heptadContext } from '../src/engine/dateConverter'
import { computeHeptad } from '../src/engine/heptadCalculator'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read heptad_1.csv from 2013 (July 26 - Aug 1, 2013)
const csvPath = join(__dirname, '../../_backup/public/data/csv/basic/2013/heptad_1.csv')
const csv = readFileSync(csvPath, 'utf-8')
const lines = csv.trim().split('\n')
const headers = lines[0].split(';')

// Parse CSV rows
const csvRows = lines.slice(1).map(line => {
  const vals = line.split(';')
  const row: Record<string, string> = {}
  headers.forEach((h, i) => { row[h] = vals[i]?.replace(/"/g, '') ?? '' })
  return row
})

// Compute heptad for July 26, 2013
const ctx = heptadContext(2013, 7, 26)
const results = computeHeptad(ctx)

// Fields to compare (CSV column → KinResult field)
const fieldMap: [string, string][] = [
  ['kin', 'kin'],
  ['kin_tone', 'kinTone'],
  ['kin_glyph', 'kinGlyph'],
  ['kin_color', 'kinColor'],
  ['plasma', 'plasma'],
  ['moon', 'moon'],
  ['day_of_moon', 'dayOfMoon'],
  ['heptad', 'heptad'],
  ['plasma_bmu', 'plasmaBmu'],
  ['kin_bmu', 'kinBmu'],
  ['kin_analog_bmu', 'kinAnalogBmu'],
  ['kin_guide_bmu', 'kinGuideBmu'],
  ['kin_antipod_bmu', 'kinAntipodBmu'],
  ['kin_occult_bmu', 'kinOccultBmu'],
  ['tfi_hunab_ku_total', 'tfiHunabKuTotal'],
  ['tfi_hunab_ku_bmu', 'tfiHunabKuBmu'],
  ['cumulative_tfi_hunab_ku_total', 'cumulativeTfiHunabKuTotal'],
  ['cumulative_tfi_hunab_ku_bmu', 'cumulativeTfiHunabKuBmu'],
  ['tfi_mcf_total', 'tfiMcfTotal'],
  ['tfi_mcf_bmu', 'tfiMcfBmu'],
  ['cumulative_tfi_mcf_total', 'cumulativeTfiMcfTotal'],
  ['cumulative_tfi_mcf_bmu', 'cumulativeTfiMcfBmu'],
  ['equivalent_kin', 'equivalentKin'],
  ['equivalent_kin_v', 'equivalentKinV'],
  ['equivalent_kin_h', 'equivalentKinH'],
  ['cumulative_equivalent_kin', 'cumulativeEquivalentKin'],
  ['cumulative_equivalent_kin_v', 'cumulativeEquivalentKinV'],
  ['cumulative_equivalent_kin_h', 'cumulativeEquivalentKinH'],
  ['day_time_v', 'timeCell.v'],
  ['day_time_h', 'timeCell.h'],
  ['day_time_bmu', 'timeCell.baseUnit'],
  ['day_time_total', 'timeCell.total'],
  ['day_time_time_unit', 'timeCell.timeUnit'],
  ['day_time_space_unit', 'timeCell.spaceUnit'],
  ['day_time_sync_unit', 'timeCell.syncUnit'],
  ['day_space_v', 'spaceCell.v'],
  ['day_space_h', 'spaceCell.h'],
  ['day_space_mbu', 'spaceCell.baseUnit'],
  ['day_space_total', 'spaceCell.total'],
  ['day_space_time_unit', 'spaceCell.timeUnit'],
  ['day_space_space_unit', 'spaceCell.spaceUnit'],
  ['day_space_sync_unit', 'spaceCell.syncUnit'],
  ['day_sync_v', 'syncCell.v'],
  ['day_sync_h', 'syncCell.h'],
  ['day_sync_bmu', 'syncCell.baseUnit'],
  ['day_sync_total', 'syncCell.total'],
  ['day_sync_time_unit', 'syncCell.timeUnit'],
  ['day_sync_space_unit', 'syncCell.spaceUnit'],
  ['day_sync_sync_unit', 'syncCell.syncUnit'],
  ['psi_chrono_unit', 'psiChronoUnit'],
  ['psi_chrono_unit_bmu', 'psiChronoUnitBmu'],
  ['psi_chrono_unit_v', 'psiChronoUnitV'],
  ['psi_chrono_unit_h', 'psiChronoUnitH'],
  ['heptad_from_bmu', 'heptadFromBmu'],
  ['heptad_to_bmu', 'heptadToBmu'],
  ['reciprocal_interval', 'reciprocalInterval'],
  ['reciprocal_sum', 'reciprocalSum'],
  ['reciprocal_composite', 'reciprocalComposite'],
  ['i_ching', 'iChing'],
]

function getValue(obj: any, path: string): any {
  const parts = path.split('.')
  let val = obj
  for (const p of parts) val = val[p]
  return val
}

let totalChecks = 0
let failures = 0

for (let i = 0; i < 7; i++) {
  const csvRow = csvRows[i]
  const computed = results[i]

  console.log(`\nDay ${i + 1}: ${csvRow.gregorian_datetime} (kin ${csvRow.kin})`)

  for (const [csvCol, resultField] of fieldMap) {
    const expected = csvRow[csvCol]
    if (expected === undefined || expected === '') continue

    const actual = getValue(computed, resultField)
    totalChecks++

    if (String(actual) !== expected) {
      console.log(`  FAIL: ${csvCol} = ${expected}, got ${actual}`)
      failures++
    }
  }
}

console.log(`\n${'='.repeat(50)}`)
console.log(`Total checks: ${totalChecks}`)
console.log(`Failures: ${failures}`)
console.log(failures === 0 ? 'ALL CHECKS PASSED!' : `${failures} FAILURES`)
