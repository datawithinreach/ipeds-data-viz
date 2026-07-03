#!/usr/bin/env node
/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'ipeds_output', 'data');
const DICT_DIR = path.join(ROOT, 'ipeds_output', 'dict');
const OUT_BASE = path.join(ROOT, 'data', '2024');

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  const headers = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (cells[j] ?? '').trim();
    }
    rows.push(row);
  }
  return { headers: headers.map((h) => h.trim()), rows };
}

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cur += c;
      }
    } else {
      if (c === ',') {
        out.push(cur);
        cur = '';
      } else if (c === '"') {
        inQuotes = true;
      } else {
        cur += c;
      }
    }
  }
  out.push(cur);
  return out;
}

function loadDict(survey, year) {
  const fname = path.join(DICT_DIR, `${survey}_${year}_dict.csv`);
  if (!fs.existsSync(fname)) return {};
  const text = fs.readFileSync(fname, 'utf8');
  const { rows } = parseCsv(text);
  // varlist sheet: row_idx 0 holds headers; col_2 = varname, col_7 = varTitle
  const map = {};
  let headerRow = null;
  for (const r of rows) {
    if (r.sheet !== 'varlist') continue;
    if (r.row_idx === '0') {
      headerRow = r;
      continue;
    }
    if (!headerRow) continue;
    let varnameCol = null;
    let varTitleCol = null;
    for (const [k, v] of Object.entries(headerRow)) {
      if (v === 'varname') varnameCol = k;
      if (v === 'varTitle') varTitleCol = k;
    }
    if (!varnameCol || !varTitleCol) continue;
    const code = r[varnameCol];
    const desc = r[varTitleCol];
    if (code && desc) map[code] = desc;
  }
  return map;
}

function pickLatestYear(rows) {
  const years = [...new Set(rows.map((r) => Number(r.year)).filter((n) => !Number.isNaN(n)))];
  return Math.max(...years);
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
  console.log(`  wrote ${path.relative(ROOT, p)}`);
}

const NUMERIC_VAR_RE = /^[A-Z][A-Z0-9_]*[0-9A-Z]$/;
function shouldKeepCol(col) {
  if (!col) return false;
  if (col === 'UNITID' || col === 'year') return false;
  if (col.startsWith('X')) return false;
  if (['GRTYPE', 'CHRTSTAT', 'SECTION', 'COHORT', 'LINE', 'EFALEVEL', 'LSTUDY', 'CIPCODE', 'AWLEVEL', 'MAJORNUM'].includes(col)) return false;
  return NUMERIC_VAR_RE.test(col);
}

function convertSimple(survey, outName) {
  console.log(`\n[${survey}] simple convert`);
  const text = fs.readFileSync(path.join(SRC_DIR, `${survey}.csv`), 'utf8');
  const { headers, rows } = parseCsv(text);
  const latest = pickLatestYear(rows);
  console.log(`  latest year: ${latest}`);
  const filtered = rows.filter((r) => Number(r.year) === latest);
  const data = {};
  for (const r of filtered) {
    const id = r.UNITID;
    if (!id) continue;
    const out = {};
    for (const col of headers) {
      if (!shouldKeepCol(col)) continue;
      out[col] = r[col];
    }
    data[id] = out;
  }
  writeJson(path.join(OUT_BASE, outName, `${outName}2024.json`), data);
  const dict = loadDict(survey, latest);
  writeJson(path.join(OUT_BASE, outName, `${outName}_variables2024.json`), dict);
  console.log(`  ${Object.keys(data).length} institutions, ${Object.keys(dict).length} variables`);
}

function convertEnrollment() {
  const survey = 'EF_A';
  console.log(`\n[${survey}] enrollment (filter EFALEVEL=1)`);
  const text = fs.readFileSync(path.join(SRC_DIR, `${survey}.csv`), 'utf8');
  const { headers, rows } = parseCsv(text);
  const latest = pickLatestYear(rows);
  console.log(`  latest year: ${latest}`);
  const filtered = rows.filter((r) => Number(r.year) === latest && String(r.EFALEVEL).trim() === '1');
  const data = {};
  for (const r of filtered) {
    const id = r.UNITID;
    if (!id) continue;
    const out = {};
    for (const col of headers) {
      if (!shouldKeepCol(col)) continue;
      out[col] = r[col];
    }
    data[id] = out;
  }
  writeJson(path.join(OUT_BASE, 'enrollment', `enrollment2024.json`), data);
  const dict = loadDict(survey, latest);
  writeJson(path.join(OUT_BASE, 'enrollment', `enrollment_variables2024.json`), dict);
  console.log(`  ${Object.keys(data).length} institutions, ${Object.keys(dict).length} variables`);
}

function convertCompletions() {
  const survey = 'C_A';
  console.log(`\n[${survey}] completions (sum bachelor's AWLEVEL=05 MAJORNUM=1 across all CIPCODEs per institution)`);
  const text = fs.readFileSync(path.join(SRC_DIR, `${survey}.csv`), 'utf8');
  const { headers, rows } = parseCsv(text);
  const latest = pickLatestYear(rows);
  console.log(`  latest year: ${latest}`);
  const filtered = rows.filter((r) => {
    return Number(r.year) === latest && String(r.AWLEVEL).trim() === '05' && String(r.MAJORNUM).trim() === '1';
  });
  const numericCols = headers.filter((c) => shouldKeepCol(c));
  const data = {};
  const programCount = {};
  for (const r of filtered) {
    const id = r.UNITID;
    if (!id) continue;
    if (!data[id]) {
      data[id] = {};
      programCount[id] = 0;
    }
    programCount[id]++;
    for (const col of numericCols) {
      const v = parseFloat(r[col]);
      if (isNaN(v)) continue;
      data[id][col] = String((parseFloat(data[id][col]) || 0) + v);
    }
  }
  for (const id of Object.keys(data)) {
    data[id]['NUM_PROGRAMS'] = String(programCount[id]);
  }
  const dict = loadDict(survey, latest);
  dict['NUM_PROGRAMS'] = "Number of distinct CIP programs awarding bachelor's degrees";
  writeJson(path.join(OUT_BASE, 'completions', `completions2024.json`), data);
  writeJson(path.join(OUT_BASE, 'completions', `completions_variables2024.json`), dict);
  console.log(`  ${Object.keys(data).length} institutions, ${Object.keys(dict).length} variables`);
}

function convertGraduation() {
  const survey = 'GR';
  console.log(`\n[${survey}] graduation (GRTYPE=2 cohort + GRTYPE=3 completers, derive rate)`);
  const text = fs.readFileSync(path.join(SRC_DIR, `${survey}.csv`), 'utf8');
  const { headers, rows } = parseCsv(text);
  const latest = pickLatestYear(rows);
  console.log(`  latest year: ${latest}`);
  const cohorts = rows.filter((r) => Number(r.year) === latest && String(r.GRTYPE).trim() === '2');
  const completers = rows.filter((r) => Number(r.year) === latest && String(r.GRTYPE).trim() === '3');
  const cohortByUnit = {};
  for (const r of cohorts) cohortByUnit[r.UNITID] = r;
  const completerByUnit = {};
  for (const r of completers) completerByUnit[r.UNITID] = r;
  const ids = new Set([...Object.keys(cohortByUnit), ...Object.keys(completerByUnit)]);
  const data = {};
  for (const id of ids) {
    const c = cohortByUnit[id];
    const f = completerByUnit[id];
    const out = {};
    for (const col of headers) {
      if (!shouldKeepCol(col)) continue;
      if (c) out[`COHORT_${col}`] = c[col];
      if (f) out[`COMP_${col}`] = f[col];
    }
    if (c && f) {
      const cohortTotal = parseFloat(c.GRTOTLT);
      const compTotal = parseFloat(f.GRTOTLT);
      if (!isNaN(cohortTotal) && cohortTotal > 0 && !isNaN(compTotal)) {
        out['GRADRATE_BACH'] = ((compTotal / cohortTotal) * 100).toFixed(1);
      }
    }
    data[id] = out;
  }
  const dict = loadDict(survey, latest);
  const expandedDict = {};
  for (const [code, desc] of Object.entries(dict)) {
    expandedDict[`COHORT_${code}`] = `Bachelor's cohort: ${desc}`;
    expandedDict[`COMP_${code}`] = `Bachelor's completers (within 150% time): ${desc}`;
  }
  expandedDict['GRADRATE_BACH'] = "Bachelor's 6-year graduation rate (% of cohort completing within 150% normal time)";
  writeJson(path.join(OUT_BASE, 'graduation', `graduation2024.json`), data);
  writeJson(path.join(OUT_BASE, 'graduation', `graduation_variables2024.json`), expandedDict);
  console.log(`  ${Object.keys(data).length} institutions, ${Object.keys(expandedDict).length} variables`);
}

// =============================================================================
// Time-series converters — write all-years JSON keyed by { unitId: { year: row } }
// =============================================================================

function writeTimeSeries(survey, outName, rowFilter) {
  console.log(`\n[${survey} TS] time-series convert`);
  const text = fs.readFileSync(path.join(SRC_DIR, `${survey}.csv`), 'utf8');
  const { headers, rows } = parseCsv(text);
  const numericCols = headers.filter((c) => shouldKeepCol(c));
  const filtered = rowFilter ? rows.filter(rowFilter) : rows;
  const data = {};
  const years = new Set();
  for (const r of filtered) {
    const id = r.UNITID;
    const year = String(r.year).trim();
    if (!id || !year) continue;
    years.add(year);
    if (!data[id]) data[id] = {};
    if (!data[id][year]) data[id][year] = {};
    for (const c of numericCols) {
      if (r[c] === undefined || r[c] === '') continue;
      data[id][year][c] = r[c];
    }
  }
  writeJson(path.join(OUT_BASE, outName, `${outName}_timeseries.json`), {
    years: [...years].sort(),
    data,
  });
  console.log(`  years ${[...years].sort().join(', ')}, ${Object.keys(data).length} institutions`);
}

function writeCompletionsTimeSeries() {
  const survey = 'C_A';
  console.log(`\n[${survey} TS] completions time-series (aggregate per UNITID/year, AWLEVEL=05, MAJORNUM=1)`);
  const text = fs.readFileSync(path.join(SRC_DIR, `${survey}.csv`), 'utf8');
  const { headers, rows } = parseCsv(text);
  const numericCols = headers.filter((c) => shouldKeepCol(c));
  const filtered = rows.filter((r) => String(r.AWLEVEL).trim() === '05' && String(r.MAJORNUM).trim() === '1');
  const data = {};
  const years = new Set();
  const programCount = {};
  for (const r of filtered) {
    const id = r.UNITID;
    const year = String(r.year).trim();
    if (!id || !year) continue;
    years.add(year);
    if (!data[id]) data[id] = {};
    if (!data[id][year]) {
      data[id][year] = {};
      programCount[`${id}__${year}`] = 0;
    }
    programCount[`${id}__${year}`]++;
    for (const c of numericCols) {
      const v = parseFloat(r[c]);
      if (isNaN(v)) continue;
      data[id][year][c] = String((parseFloat(data[id][year][c]) || 0) + v);
    }
  }
  for (const id of Object.keys(data)) {
    for (const year of Object.keys(data[id])) {
      data[id][year]['NUM_PROGRAMS'] = String(programCount[`${id}__${year}`]);
    }
  }
  writeJson(path.join(OUT_BASE, 'completions', `completions_timeseries.json`), {
    years: [...years].sort(),
    data,
  });
  console.log(`  years ${[...years].sort().join(', ')}, ${Object.keys(data).length} institutions`);
}

function writeGraduationTimeSeries() {
  const survey = 'GR';
  console.log(`\n[${survey} TS] graduation time-series (GRTYPE=2 cohort + GRTYPE=3 completers + derived rate per year)`);
  const text = fs.readFileSync(path.join(SRC_DIR, `${survey}.csv`), 'utf8');
  const { headers, rows } = parseCsv(text);
  const numericCols = headers.filter((c) => shouldKeepCol(c));
  const data = {};
  const years = new Set();
  // Group rows: (id, year) -> { cohort: row, comp: row }
  const buckets = new Map();
  for (const r of rows) {
    const id = r.UNITID;
    const year = String(r.year).trim();
    const grtype = String(r.GRTYPE).trim();
    if (!id || !year) continue;
    if (grtype !== '2' && grtype !== '3') continue;
    years.add(year);
    const key = `${id}__${year}`;
    if (!buckets.has(key)) buckets.set(key, { id, year });
    if (grtype === '2') buckets.get(key).cohort = r;
    if (grtype === '3') buckets.get(key).comp = r;
  }
  for (const { id, year, cohort, comp } of buckets.values()) {
    if (!data[id]) data[id] = {};
    const out = {};
    if (cohort) for (const c of numericCols) if (cohort[c]) out[`COHORT_${c}`] = cohort[c];
    if (comp) for (const c of numericCols) if (comp[c]) out[`COMP_${c}`] = comp[c];
    if (cohort && comp) {
      const ct = parseFloat(cohort.GRTOTLT);
      const cm = parseFloat(comp.GRTOTLT);
      if (!isNaN(ct) && ct > 0 && !isNaN(cm)) {
        out.GRADRATE_BACH = ((cm / ct) * 100).toFixed(1);
      }
    }
    data[id][year] = out;
  }
  writeJson(path.join(OUT_BASE, 'graduation', `graduation_timeseries.json`), {
    years: [...years].sort(),
    data,
  });
  console.log(`  years ${[...years].sort().join(', ')}, ${Object.keys(data).length} institutions`);
}

console.log('Converting IPEDS surveys → JSON');
convertSimple('IC_AY', 'tuition');
convertEnrollment();
convertCompletions();
convertGraduation();

console.log('\n=== Time-series snapshots ===');
writeTimeSeries('ADM', 'admissions');
writeTimeSeries('IC_AY', 'tuition');
writeTimeSeries('EF_A', 'enrollment', (r) => String(r.EFALEVEL).trim() === '1');
writeCompletionsTimeSeries();
writeGraduationTimeSeries();
console.log('\nDone.');
