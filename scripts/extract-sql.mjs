#!/usr/bin/env node
/**
 * One-shot script to parse the MySQL dump and generate TypeScript data files.
 * Run: node scripts/extract-sql.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlPath = join(__dirname, '../../441sync_o2switch_06032021.sql');
const outDir = join(__dirname, '../src/engine/data');

mkdirSync(outDir, { recursive: true });

const sql = readFileSync(sqlPath, 'utf-8');

/** Extract all rows from an INSERT INTO statement for a given table */
function extractInsert(tableName) {
  // Match: INSERT INTO `tableName` (`col1`, `col2`) VALUES\n(row1),\n(row2),...;
  const re = new RegExp(
    `INSERT INTO \`${tableName}\`\\s*\\(([^)]+)\\)\\s*VALUES\\s*([\\s\\S]*?);`,
    'g'
  );
  const match = re.exec(sql);
  if (!match) throw new Error(`Table ${tableName} not found`);

  const colNames = match[1].replace(/`/g, '').split(',').map(c => c.trim());
  const valuesBlock = match[2];

  // Parse each row: (val1, val2, ...)
  const rows = [];
  const rowRe = /\(([^)]+)\)/g;
  let rowMatch;
  while ((rowMatch = rowRe.exec(valuesBlock)) !== null) {
    const vals = rowMatch[1].split(',').map(v => {
      v = v.trim();
      if (v === 'NULL') return null;
      if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
      return Number(v);
    });
    const row = {};
    colNames.forEach((col, i) => { row[col] = vals[i]; });
    rows.push(row);
  }
  return { colNames, rows };
}

function toCamelCase(s) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function generateFile(tableName, typeName, mapping, fileName) {
  const { rows } = extractInsert(tableName);

  const tsRows = rows.map(row => {
    const fields = mapping.map(([sqlCol, tsField, type]) => {
      const val = row[sqlCol];
      if (val === null) return `  ${tsField}: null`;
      if (type === 'string') return `  ${tsField}: '${val}'`;
      if (type === 'boolean') return `  ${tsField}: ${val === 1 ? 'true' : 'false'}`;
      return `  ${tsField}: ${val}`;
    });
    return `{ ${fields.join(', ')} }`;
  });

  const typeFields = mapping.map(([, tsField, type]) => {
    if (type === 'string') return `  ${tsField}: string`;
    if (type === 'boolean') return `  ${tsField}: boolean`;
    if (type === 'number|null') return `  ${tsField}: number | null`;
    return `  ${tsField}: number`;
  }).join('\n');

  const content = `export interface ${typeName} {\n${typeFields}\n}\n\nexport const ${fileName}: ${typeName}[] = [\n  ${tsRows.join(',\n  ')},\n]\n`;

  writeFileSync(join(outDir, `${fileName}.ts`), content);
  console.log(`  ${fileName}.ts: ${rows.length} rows`);
}

console.log('Extracting SQL data into TypeScript files...\n');

generateFile('colors', 'Color', [
  ['id', 'id', 'number'],
  ['name', 'name', 'string'],
], 'colors');

generateFile('days_of_moon', 'DayOfMoon', [
  ['id', 'id', 'number'],
  ['plasma_id', 'plasmaId', 'number'],
  ['i_ching', 'iChing', 'number'],
], 'daysOfMoon');

generateFile('glyphs', 'Glyph', [
  ['id', 'id', 'number'],
  ['color_id', 'colorId', 'number|null'],
  ['name', 'name', 'string'],
  ['bmu', 'bmu', 'number'],
], 'glyphs');

generateFile('grid', 'GridCell', [
  ['id', 'id', 'number'],
  ['v', 'v', 'number'],
  ['h', 'h', 'number'],
  ['base_unit', 'baseUnit', 'number'],
  ['time_unit', 'timeUnit', 'number'],
  ['space_unit', 'spaceUnit', 'number'],
  ['sync_unit', 'syncUnit', 'number'],
], 'grid');

generateFile('plasmas', 'Plasma', [
  ['id', 'id', 'number'],
  ['name', 'name', 'string'],
  ['bmu', 'bmu', 'number'],
], 'plasmas');

generateFile('pulsars', 'Pulsar', [
  ['id', 'id', 'number'],
  ['name', 'name', 'string'],
  ['realm', 'realm', 'string'],
], 'pulsars');

generateFile('reciprocals', 'Reciprocal', [
  ['id', 'id', 'number'],
  ['plasma_id', 'plasmaId', 'number'],
  ['tone_id', 'toneId', 'number'],
  ['interval', 'interval', 'number'],
  ['sum', 'sum', 'number'],
  ['composite', 'composite', 'number'],
], 'reciprocals');

generateFile('references', 'YearReference', [
  ['id', 'id', 'number'],
  ['first_of_january', 'firstOfJanuary', 'number'],
  ['26th_of_july', 'twentySixthOfJuly', 'number'],
], 'references');

generateFile('tollan', 'TollanEntry', [
  ['id', 'id', 'number'],
  ['from_id', 'fromId', 'number'],
  ['to_id', 'toId', 'number'],
], 'tollan');

generateFile('tones', 'Tone', [
  ['id', 'id', 'number'],
  ['name', 'name', 'string'],
  ['pulse_id', 'pulsarId', 'number'],
], 'tones');

generateFile('tzolkin', 'TzolkinKin', [
  ['id', 'id', 'number'],
  ['tone_id', 'toneId', 'number'],
  ['glyph_id', 'glyphId', 'number'],
  ['portal', 'portal', 'boolean'],
  ['guide_kin', 'guideKin', 'number'],
  ['analog_kin', 'analogKin', 'number'],
  ['antipod_kin', 'antipodKin', 'number'],
  ['occult_kin', 'occultKin', 'number'],
], 'tzolkin');

generateFile('year', 'YearDay', [
  ['id', 'id', 'number'],
  ['tone_id', 'moonId', 'number'],
  ['day_of_moon_id', 'dayOfMoonId', 'number'],
  ['gregorian_month', 'gregorianMonth', 'number'],
  ['gregorian_day', 'gregorianDay', 'number'],
  ['v', 'v', 'number'],
  ['h', 'h', 'number'],
  ['psi_chrono_unit', 'psiChronoUnit', 'number'],
], 'yearDays');

console.log('\nDone! All data files generated in src/engine/data/');
