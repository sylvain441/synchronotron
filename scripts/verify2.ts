import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { heptadContext } from '../src/engine/dateConverter'
import { computeHeptad } from '../src/engine/heptadCalculator'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Test heptad_30 from 2014 (Feb 14-20, 2014)
const csvPath = join(__dirname, '../../_backup/public/data/csv/basic/2014/heptad_30.csv')
const csv = readFileSync(csvPath, 'utf-8')
const lines = csv.trim().split('\n')
const headers = lines[0].split(';')
const csvRows = lines.slice(1).map(line => {
  const vals = line.split(';')
  const row: Record<string, string> = {}
  headers.forEach((h, i) => { row[h] = vals[i]?.replace(/"/g, '') ?? '' })
  return row
})

const ctx = heptadContext(2014, 2, 14)
const results = computeHeptad(ctx)

const fieldMap: [string, string][] = [
  ['kin', 'kin'], ['kin_tone', 'kinTone'], ['kin_glyph', 'kinGlyph'],
  ['tfi_hunab_ku_total', 'tfiHunabKuTotal'], ['tfi_hunab_ku_bmu', 'tfiHunabKuBmu'],
  ['tfi_mcf_total', 'tfiMcfTotal'], ['tfi_mcf_bmu', 'tfiMcfBmu'],
  ['equivalent_kin', 'equivalentKin'],
  ['cumulative_tfi_hunab_ku_total', 'cumulativeTfiHunabKuTotal'],
  ['cumulative_tfi_mcf_total', 'cumulativeTfiMcfTotal'],
  ['day_time_v', 'timeCell.v'], ['day_time_h', 'timeCell.h'],
  ['day_space_v', 'spaceCell.v'], ['day_space_h', 'spaceCell.h'],
  ['day_sync_v', 'syncCell.v'], ['day_sync_h', 'syncCell.h'],
  ['reciprocal_interval', 'reciprocalInterval'],
  ['i_ching', 'iChing'],
]

function getValue(obj: any, path: string): any {
  const parts = path.split('.')
  let val = obj
  for (const p of parts) val = val[p]
  return val
}

let total = 0, fails = 0
for (let i = 0; i < 7; i++) {
  const csvRow = csvRows[i]
  const computed = results[i]
  for (const [csvCol, resultField] of fieldMap) {
    const expected = csvRow[csvCol]
    if (!expected) continue
    total++
    const actual = getValue(computed, resultField)
    if (String(actual) !== expected) {
      console.log(`Day ${i+1} FAIL: ${csvCol} = ${expected}, got ${actual}`)
      fails++
    }
  }
}
console.log(`Heptad 30 (Feb 2014): ${total} checks, ${fails} failures`)
console.log(fails === 0 ? 'ALL PASSED!' : `${fails} FAILURES`)
