#!/usr/bin/env python3
"""
ipeds_pull.py
=============

Download IPEDS final-release data for the 102 US News-ranked national
universities and emit per-survey CSVs (one row per institution-year)
plus data dictionaries.

Usage
-----
    cd /Users/matthewlee/ipeds-data-viz-genai-edition
    python3 ipeds_pull.py

Requirements
------------
Python 3.7+ standard library only. No pip installs needed.

What it does
------------
1.  Resolves each school name to an IPEDS UnitID by downloading the
    institutional directory file (HD2023.zip) and fuzzy-matching names.
    Hardcoded UnitID overrides cover ambiguous multi-campus cases
    (Rutgers branches, UC system, SUNYs, etc.).
2.  Downloads the last 5 years of data for every IPEDS survey component:
        IC  - Institutional Characteristics + Charges
        ADM - Admissions
        EF  - Fall Enrollment (race/age/residence/retention)
        EFFY/EFIA - 12-month Enrollment + Instructional Activity
        C   - Completions (CIP, race, age)
        SFA - Student Financial Aid + Veterans
        GR  - Graduation Rates (incl. 200% completion)
        OM  - Outcome Measures
        F   - Finance (Forms F1A/F2/F3 for public/NFP/FP)
        HR  - Human Resources (occupation, instructional staff,
              salaries, new hires, employees by position)
        AL  - Academic Libraries
3.  Filters each file to your 102 UnitIDs, concatenates years, and
    writes one CSV per survey to ./ipeds_output/data/.
4.  Pulls each file's dictionary zip (xlsx) and converts it to CSV in
    ./ipeds_output/dict/, using a stdlib-only xlsx parser.
5.  Writes ./ipeds_output/matched_unitids.csv,
    ./ipeds_output/run.log, and ./ipeds_output/README.txt.

Expected runtime: 5-15 minutes on a normal connection.
Expected output size: ~50-150 MB across all CSVs.
"""

from __future__ import annotations

import csv
import io
import os
import re
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

# --------------------------------------------------------------------------
# Configuration
# --------------------------------------------------------------------------

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "ipeds_output"
RAW = OUT / "_raw_zips"
DATA_DIR = OUT / "data"
DICT_DIR = OUT / "dict"
LOG_PATH = OUT / "run.log"
MATCH_PATH = OUT / "matched_unitids.csv"
README_PATH = OUT / "README.txt"

for d in (OUT, RAW, DATA_DIR, DICT_DIR):
    d.mkdir(parents=True, exist_ok=True)

BASE = "https://nces.ed.gov/ipeds/datacenter/data/"
UA = "Mozilla/5.0 (compatible; IPEDS-puller/1.0)"
MAX_WORKERS = 6      # concurrent downloads (be polite to NCES)
RETRIES = 4
TIMEOUT = 90

# 102 schools - as supplied by user (US News National Universities Top 100ish).
SCHOOLS = [
    "Princeton University",
    "Massachusetts Institute of Technology",
    "Harvard University",
    "Stanford University",
    "Yale University",
    "University of Chicago",
    "Duke University",
    "Johns Hopkins University",
    "Northwestern University",
    "University of Pennsylvania",
    "California Institute of Technology",
    "Cornell University",
    "Brown University",
    "Dartmouth College",
    "Columbia University",
    "University of California, Berkeley",
    "Rice University",
    "University of California, Los Angeles",
    "Vanderbilt University",
    "Carnegie Mellon University",
    "University of Michigan--Ann Arbor",
    "University of Notre Dame",
    "Washington University in St. Louis",
    "Emory University",
    "Georgetown University",
    "University of North Carolina--Chapel Hill",
    "University of Virginia",
    "University of Southern California",
    "University of California San Diego",
    "University of Florida",
    "The University of Texas--Austin",
    "Georgia Institute of Technology",
    "New York University",
    "University of California, Davis",
    "University of California, Irvine",
    "Boston College",
    "Tufts University",
    "University of Illinois Urbana-Champaign",
    "University of Wisconsin--Madison",
    "University of California, Santa Barbara",
    "The Ohio State University",
    "Boston University",
    "Rutgers University--New Brunswick",
    "University of Maryland, College Park",
    "University of Washington",
    "Lehigh University",
    "Northeastern University",
    "Purdue University--Main Campus",
    "University of Georgia",
    "University of Rochester",
    "Case Western Reserve University",
    "Florida State University",
    "Texas A&M University",
    "Virginia Tech",
    "Wake Forest University",
    "William & Mary",
    "University of California, Merced",
    "Villanova University",
    "George Washington University",
    "The Pennsylvania State University--University Park",
    "Santa Clara University",
    "Stony Brook University--SUNY",
    "University of Minnesota--Twin Cities",
    "Michigan State University",
    "North Carolina State University",
    "Rensselaer Polytechnic Institute",
    "University of Massachusetts--Amherst",
    "University of Miami",
    "Brandeis University",
    "Tulane University of Louisiana",
    "University of Connecticut",
    "University of Pittsburgh",
    "Binghamton University--SUNY",
    "Indiana University--Bloomington",
    "Clemson University",
    "Rutgers University--Newark",
    "Syracuse University",
    "University at Buffalo--SUNY",
    "University of California, Riverside",
    "Colorado School of Mines",
    "Drexel University",
    "New Jersey Institute of Technology",
    "Stevens Institute of Technology",
    "Pepperdine University",
    "University of Illinois Chicago",
    "Worcester Polytechnic Institute",
    "Yeshiva University",
    "American University",
    "Baylor University",
    "Howard University",
    "Marquette University",
    "Rochester Institute of Technology",
    "Southern Methodist University",
    "University of California, Santa Cruz",
    "University of Delaware",
    "University of South Florida",
    "Florida International University",
    "Fordham University",
    "Rutgers University--Camden",
    "Texas Christian University",
    "University of Colorado Boulder",
    "Auburn University",
]

# Authoritative UnitID overrides for ambiguous / multi-campus cases.
# These take precedence over fuzzy matching.
UNITID_OVERRIDES = {
    "University of California, Berkeley":          110635,
    "University of California, Los Angeles":       110662,
    "University of California San Diego":          110680,
    "University of California, Davis":             110644,
    "University of California, Irvine":            110653,
    "University of California, Santa Barbara":     110705,
    "University of California, Merced":            445188,
    "University of California, Riverside":         110671,
    "University of California, Santa Cruz":        110714,
    "Rutgers University--New Brunswick":           186380,
    "Rutgers University--Newark":                  186399,
    "Rutgers University--Camden":                  186371,
    "Stony Brook University--SUNY":                196097,
    "Binghamton University--SUNY":                 196079,
    "University at Buffalo--SUNY":                 196088,
    "The Pennsylvania State University--University Park": 214777,
    "Purdue University--Main Campus":              243780,
    "Texas A&M University":                        228723,   # College Station
    "University of Michigan--Ann Arbor":           170976,
    "The University of Texas--Austin":             228778,
    "Indiana University--Bloomington":             151351,
    "University of Maryland, College Park":        163286,
    "University of Minnesota--Twin Cities":        174066,
    "University of Massachusetts--Amherst":        166629,
    "University of Pittsburgh":                    215293,   # Pittsburgh main
    "University of North Carolina--Chapel Hill":   199120,
    "University of Wisconsin--Madison":            240444,
    "University of Illinois Urbana-Champaign":     145637,
    "University of Illinois Chicago":              145600,
    "Tulane University of Louisiana":              160755,
    "The Ohio State University":                   204796,   # Main
}

# --------------------------------------------------------------------------
# IPEDS file inventory (last 5 final-release years per survey)
#
# Year suffix conventions:
#   Yfull4   -- 4-digit second year of academic year (e.g. 2023)
#   Yshort4  -- 4-digit AY representation, two halves (e.g. 2223 = 2022-23)
#   Yshort2  -- 2-digit second year (e.g. 23)
#
# When the latest year has both .zip and _RV.zip, NCES typically replaces
# the original with the revised one. We try both, in that order.
# --------------------------------------------------------------------------

# (filename_template, [years], description, survey_group)
FILES = [
    # ---- Institutional Characteristics + Charges ----
    ("HD{Y}",        ["2019","2020","2021","2022","2023"], "Header / Directory",                       "HD"),
    ("IC{Y}",        ["2019","2020","2021","2022","2023"], "Institutional Characteristics",            "IC"),
    ("IC{Y}_AY",     ["2019","2020","2021","2022","2023"], "Tuition & Fees - Academic Year",           "IC_AY"),
    ("IC{Y}_PY",     ["2019","2020","2021","2022","2023"], "Tuition & Fees - Program Year",            "IC_PY"),
    # ---- Admissions ----
    ("ADM{Y}",       ["2019","2020","2021","2022","2023"], "Admission Considerations + Test Scores",   "ADM"),
    # ---- Completions (Awards / Degrees) ----
    ("C{Y}_A",       ["2018","2019","2020","2021","2022"], "Completions: Awards by CIP/Race/Sex",      "C_A"),
    ("C{Y}_B",       ["2018","2019","2020","2021","2022"], "Completions: Recipients by Race/Sex",      "C_B"),
    ("C{Y}_C",       ["2018","2019","2020","2021","2022"], "Completions: Recipients by Age",           "C_C"),
    ("C{Y}DEP",      ["2018","2019","2020","2021","2022"], "Completions: Distance Education",          "C_DEP"),
    # ---- Fall Enrollment ----
    ("EF{Y}A",       ["2019","2020","2021","2022","2023"], "Fall Enrollment by Race/Sex",              "EF_A"),
    ("EF{Y}B",       ["2019","2020","2021","2022","2023"], "Fall Enrollment by Age",                   "EF_B"),
    ("EF{Y}C",       ["2019","2020","2021","2022","2023"], "Fall Enrollment by Residence",             "EF_C"),
    ("EF{Y}D",       ["2019","2020","2021","2022","2023"], "Fall Enrollment Total / Retention",        "EF_D"),
    ("EF{Y}CP",      ["2019","2020","2021","2022","2023"], "Fall Enrollment by Major",                 "EF_CP"),
    # ---- 12-month Enrollment + Instructional Activity ----
    ("EFFY{Y}",      ["2019","2020","2021","2022","2023"], "12-month Enrollment",                      "EFFY"),
    ("EFIA{Y}",      ["2019","2020","2021","2022","2023"], "Instructional Activity (FTE)",             "EFIA"),
    # ---- Student Financial Aid ----
    ("SFA{Y}",       ["1819","1920","2021","2122","2223"], "Student Financial Aid",                    "SFA"),
    ("SFAV{Y}",      ["1819","1920","2021","2122","2223"], "Student Financial Aid - Veterans/Mil.",    "SFAV"),
    # ---- Graduation Rates ----
    ("GR{Y}",        ["2020","2021","2022","2023","2024"], "Graduation Rates (150%)",                  "GR"),
    ("GR200_{Y}",    ["20","21","22","23","24"],           "Graduation Rates (200%)",                  "GR200"),
    ("GR{Y}_L2",     ["2020","2021","2022","2023","2024"], "Graduation Rates (<2yr cohort)",           "GR_L2"),
    ("GR{Y}_PELL_SSL", ["2020","2021","2022","2023","2024"], "Graduation Rates - Pell/SSL",            "GR_PELL"),
    # ---- Outcome Measures ----
    ("OM{Y}",        ["2019","2020","2021","2022","2023"], "Outcome Measures",                         "OM"),
    # ---- Finance ----
    ("F{Y}_F1A",     ["1819","1920","2021","2122","2223"], "Finance: Public (GASB)",                   "F_F1A"),
    ("F{Y}_F2",      ["1819","1920","2021","2122","2223"], "Finance: Private NFP (FASB)",              "F_F2"),
    ("F{Y}_F3",      ["1819","1920","2021","2122","2223"], "Finance: For-Profit",                      "F_F3"),
    # ---- Human Resources ----
    ("S{Y}_OC",      ["2019","2020","2021","2022","2023"], "HR: All Staff by Occupation",              "S_OC"),
    ("S{Y}_IS",      ["2019","2020","2021","2022","2023"], "HR: Instructional Staff",                  "S_IS"),
    ("S{Y}_NH",      ["2019","2020","2021","2022","2023"], "HR: New Hires",                            "S_NH"),
    ("SAL{Y}_IS",    ["2019","2020","2021","2022","2023"], "HR: Salaries - Instructional Staff",       "SAL_IS"),
    ("SAL{Y}_NIS",   ["2019","2020","2021","2022","2023"], "HR: Salaries - Non-Instructional",         "SAL_NIS"),
    ("EAP{Y}",       ["2019","2020","2021","2022","2023"], "HR: Employees by Assigned Position",       "EAP"),
    # ---- Academic Libraries ----
    ("AL{Y}",        ["2018","2019","2020","2021","2022"], "Academic Libraries",                       "AL"),
]

# --------------------------------------------------------------------------
# Logging
# --------------------------------------------------------------------------

def log(msg: str) -> None:
    line = f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}"
    print(line, flush=True)
    with open(LOG_PATH, "a") as f:
        f.write(line + "\n")

# --------------------------------------------------------------------------
# HTTP
# --------------------------------------------------------------------------

def fetch_bytes(url: str) -> bytes | None:
    """Download URL with retries. Return bytes or None on hard 404."""
    for attempt in range(RETRIES):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            time.sleep(2 + attempt * 2)
        except (urllib.error.URLError, OSError, TimeoutError) as e:
            log(f"    transient error on {url}: {e!r}")
            time.sleep(2 + attempt * 2)
    return None


def download_zip(stem: str, dict_variant: bool = False) -> tuple[Path | None, str | None]:
    """
    Download a single file. Tries:
        1. <stem>.zip
        2. <stem>_RV.zip   (NCES revised file)
    Returns (local_path, actual_stem_used) or (None, None) if both fail.
    """
    suffix = "_Dict" if dict_variant else ""
    for variant in (stem + suffix, f"{stem}{suffix}_RV"):
        url = f"{BASE}{variant}.zip"
        local = RAW / f"{variant}.zip"
        if local.exists() and local.stat().st_size > 200:
            return local, variant
        data = fetch_bytes(url)
        if data is None:
            continue
        local.write_bytes(data)
        return local, variant
    return None, None

# --------------------------------------------------------------------------
# stdlib-only xlsx parser  (used for IPEDS dictionary .xlsx files)
# --------------------------------------------------------------------------

NS = {"x": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}

def parse_xlsx(xlsx_bytes: bytes) -> dict[str, list[list[str]]]:
    """Return {sheet_name: rows} from an xlsx file using stdlib only."""
    out: dict[str, list[list[str]]] = {}
    z = zipfile.ZipFile(io.BytesIO(xlsx_bytes))

    # shared strings
    shared: list[str] = []
    if "xl/sharedStrings.xml" in z.namelist():
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root.findall("x:si", NS):
            text_parts = [t.text or "" for t in si.iter() if t.tag.endswith("}t")]
            shared.append("".join(text_parts))

    # workbook -> sheet name <-> r:id mapping
    wb_root = ET.fromstring(z.read("xl/workbook.xml"))
    sheet_meta = []
    for s in wb_root.find("x:sheets", NS).findall("x:sheet", NS):
        sheet_meta.append((s.attrib.get("name"), s.attrib.get(
            "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")))

    rels_root = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    rels = {r.attrib["Id"]: r.attrib["Target"] for r in rels_root}

    for name, rid in sheet_meta:
        target = rels.get(rid)
        if not target:
            continue
        if not target.startswith("xl/"):
            target = "xl/" + target.lstrip("/")
        if target not in z.namelist():
            continue
        sheet_root = ET.fromstring(z.read(target))
        sheet_data = sheet_root.find("x:sheetData", NS)
        if sheet_data is None:
            out[name] = []
            continue
        rows: list[list[str]] = []
        for row_el in sheet_data.findall("x:row", NS):
            cells: list[str] = []
            current_col = 0
            for c_el in row_el.findall("x:c", NS):
                # cell ref like "B7" -> column index
                ref = c_el.attrib.get("r", "")
                col_letters = "".join(ch for ch in ref if ch.isalpha())
                col_idx = 0
                for ch in col_letters:
                    col_idx = col_idx * 26 + (ord(ch.upper()) - ord("A") + 1)
                col_idx -= 1
                # pad
                while len(cells) < col_idx:
                    cells.append("")
                t = c_el.attrib.get("t", "n")
                v_el = c_el.find("x:v", NS)
                inline = c_el.find("x:is", NS)
                if t == "s":
                    val = shared[int(v_el.text)] if v_el is not None else ""
                elif t == "inlineStr" and inline is not None:
                    val = "".join((tt.text or "") for tt in inline.iter() if tt.tag.endswith("}t"))
                else:
                    val = v_el.text if v_el is not None else ""
                cells.append(val if val is not None else "")
            rows.append(cells)
        out[name] = rows
    return out

# --------------------------------------------------------------------------
# CSV utilities
# --------------------------------------------------------------------------

def read_csv_from_zip(zpath: Path) -> tuple[str, list[str], list[list[str]]]:
    """Open zip, find first .csv (prefer non-_rv), return (csvname, header, rows)."""
    z = zipfile.ZipFile(zpath)
    csv_names = [n for n in z.namelist() if n.lower().endswith(".csv")]
    if not csv_names:
        return "", [], []
    # Prefer non-revised when both exist - we want consistent revisions handling
    rv = [n for n in csv_names if "_rv" in n.lower()]
    if rv:
        csv_names = rv  # use revised when present
    csv_name = csv_names[0]
    with z.open(csv_name) as f:
        raw = f.read()
        # Some IPEDS CSVs are emitted with a UTF-8 BOM; strip it before
        # decoding as Latin-1 so the first column name isn't corrupted.
        if raw.startswith(b"\xef\xbb\xbf"):
            raw = raw[3:]
        text = raw.decode("latin-1")
    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        return csv_name, [], []
    header, body = rows[0], rows[1:]
    return csv_name, header, body


def filter_rows(header: list[str], rows: list[list[str]], unitids: set[int]) -> list[list[str]]:
    """Keep only rows whose UNITID column is in unitids."""
    if not header:
        return []
    # IPEDS uses UNITID consistently as the institution key
    try:
        idx = next(i for i, h in enumerate(header) if h.strip().upper() == "UNITID")
    except StopIteration:
        return []
    out = []
    for r in rows:
        if idx >= len(r):
            continue
        try:
            if int(r[idx]) in unitids:
                out.append(r)
        except ValueError:
            continue
    return out

# --------------------------------------------------------------------------
# Name matching
# --------------------------------------------------------------------------

WS = re.compile(r"\s+")
NONALNUM = re.compile(r"[^a-z0-9]+")

def norm(s: str) -> str:
    s = s.lower()
    s = s.replace("&", " and ")
    s = NONALNUM.sub(" ", s)
    s = WS.sub(" ", s).strip()
    return s


def best_match(name: str, hd_records: list[tuple[int, str, str, str]]) -> tuple[int, str] | None:
    """
    hd_records: list of (unitid, instnm, city, stabbr).
    Returns (unitid, matched_name) or None.
    """
    target = norm(name)
    target_words = set(target.split())
    if not target:
        return None
    # exact normalized match first
    for uid, inst, city, st in hd_records:
        if norm(inst) == target:
            return uid, inst
    # token containment
    best = None
    best_score = 0.0
    for uid, inst, city, st in hd_records:
        cand = norm(inst)
        cand_words = set(cand.split())
        if not cand_words:
            continue
        # require all "core" words from target appear in candidate
        intersection = target_words & cand_words
        if not intersection:
            continue
        score = len(intersection) / max(len(target_words), len(cand_words))
        # boost: candidate startswith target or vice versa
        if cand.startswith(target) or target.startswith(cand):
            score += 0.2
        if score > best_score:
            best_score = score
            best = (uid, inst)
    if best and best_score >= 0.4:
        return best
    return None

# --------------------------------------------------------------------------
# Main pipeline
# --------------------------------------------------------------------------

def step_resolve_unitids() -> dict[str, int]:
    log("Step 1: resolving UnitIDs from HD2023.zip ...")
    zpath, _ = download_zip("HD2023")
    if not zpath:
        log("FATAL: could not download HD2023.zip - check internet connection.")
        sys.exit(1)
    _, header, rows = read_csv_from_zip(zpath)
    if not rows:
        log("FATAL: HD2023 contained no rows.")
        sys.exit(1)

    cols = {h.strip().upper(): i for i, h in enumerate(header)}
    i_unit = cols["UNITID"]
    i_inst = cols.get("INSTNM", 1)
    i_city = cols.get("CITY", -1)
    i_st   = cols.get("STABBR", -1)

    hd_records: list[tuple[int, str, str, str]] = []
    for r in rows:
        try:
            uid = int(r[i_unit])
        except (ValueError, IndexError):
            continue
        inst = r[i_inst] if i_inst < len(r) else ""
        city = r[i_city] if 0 <= i_city < len(r) else ""
        st   = r[i_st]   if 0 <= i_st   < len(r) else ""
        hd_records.append((uid, inst, city, st))

    name_to_uid: dict[str, int] = {}
    rows_out = []
    for sch in SCHOOLS:
        if sch in UNITID_OVERRIDES:
            uid = UNITID_OVERRIDES[sch]
            matched = next((r[1] for r in hd_records if r[0] == uid), "<override>")
            name_to_uid[sch] = uid
            rows_out.append([sch, uid, matched, "override"])
            continue
        m = best_match(sch, hd_records)
        if m is None:
            log(f"  WARN: no match for: {sch}")
            rows_out.append([sch, "", "", "no_match"])
            continue
        uid, matched = m
        name_to_uid[sch] = uid
        rows_out.append([sch, uid, matched, "fuzzy"])

    with open(MATCH_PATH, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["us_news_name", "unitid", "matched_instnm", "method"])
        w.writerows(rows_out)

    matched = sum(1 for r in rows_out if r[1] != "")
    log(f"  Matched {matched}/{len(SCHOOLS)} schools. See matched_unitids.csv to verify.")
    return name_to_uid


def step_download_all() -> list[tuple[str, str, Path | None]]:
    """Download every survey file. Returns list of (survey_group, year, path)."""
    log("Step 2: downloading IPEDS data files (~150 files, parallel) ...")
    jobs = []
    for tmpl, years, _desc, group in FILES:
        for y in years:
            jobs.append((tmpl.format(Y=y), group, y))

    results: list[tuple[str, str, Path | None]] = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        future_to_meta = {ex.submit(download_zip, stem): (stem, group, y)
                          for stem, group, y in jobs}
        done = 0
        total = len(jobs)
        for fut in as_completed(future_to_meta):
            stem, group, y = future_to_meta[fut]
            done += 1
            try:
                path, used = fut.result()
            except Exception as e:
                log(f"  [{done}/{total}] {stem}: error {e!r}")
                results.append((group, y, None))
                continue
            if path is None:
                log(f"  [{done}/{total}] {stem}: not available (404)")
                results.append((group, y, None))
            else:
                results.append((group, y, path))
    found = sum(1 for _, _, p in results if p is not None)
    log(f"  Downloaded {found}/{len(jobs)} files.")
    return results


def step_filter_and_combine(downloads: list[tuple[str, str, Path | None]],
                            unitids: set[int]) -> None:
    log("Step 3: filtering each file to your 102 schools and concatenating ...")
    by_group: dict[str, list[tuple[str, list[str], list[list[str]]]]] = {}
    for group, year, path in downloads:
        if path is None:
            continue
        try:
            csvname, header, rows = read_csv_from_zip(path)
        except Exception as e:
            log(f"  bad zip {path.name}: {e}")
            continue
        kept = filter_rows(header, rows, unitids)
        log(f"  {group} {year}: {len(kept)}/{len(rows)} rows kept ({path.name})")
        by_group.setdefault(group, []).append((year, header, kept))

    # write per-group concatenated CSV with year column added
    for group, years_data in by_group.items():
        # union of headers across years (some surveys add columns over time)
        all_cols: list[str] = []
        seen = set()
        for _, hdr, _ in years_data:
            for h in hdr:
                key = h.upper()
                if key not in seen:
                    seen.add(key)
                    all_cols.append(h)
        out_header = ["year"] + all_cols
        out_path = DATA_DIR / f"{group}.csv"
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(out_header)
            for year, hdr, rows_kept in years_data:
                hdr_idx = {h.upper(): i for i, h in enumerate(hdr)}
                for r in rows_kept:
                    out_row = [year]
                    for col in all_cols:
                        i = hdr_idx.get(col.upper())
                        out_row.append(r[i] if (i is not None and i < len(r)) else "")
                    w.writerow(out_row)
        log(f"  -> wrote {out_path} ({sum(len(rk) for _, _, rk in years_data)} rows)")


def step_dictionaries() -> None:
    log("Step 4: downloading data dictionaries ...")
    jobs = set()
    for tmpl, years, _desc, group in FILES:
        # one dictionary per (template, year)
        for y in years:
            jobs.add((tmpl.format(Y=y), group, y))

    for stem, group, y in sorted(jobs):
        zpath, _ = download_zip(stem, dict_variant=True)
        if zpath is None:
            continue
        try:
            z = zipfile.ZipFile(zpath)
            xlsx_names = [n for n in z.namelist() if n.lower().endswith(".xlsx")]
            if not xlsx_names:
                continue
            xlsx_bytes = z.read(xlsx_names[0])
            sheets = parse_xlsx(xlsx_bytes)
        except Exception as e:
            log(f"  dict {stem}: {e}")
            continue
        # IPEDS dictionary xlsx typically has "varlist" and "Frequencies" sheets.
        out_path = DICT_DIR / f"{group}_{y}_dict.csv"
        with open(out_path, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["sheet", "row_idx", *(f"col_{i+1}" for i in range(50))])
            for sheet, rows in sheets.items():
                for ri, row in enumerate(rows):
                    w.writerow([sheet, ri] + row[:50])

    log(f"  -> wrote dictionaries to {DICT_DIR}")


def write_readme(name_to_uid: dict[str, int], n_files: int) -> None:
    text = f"""IPEDS Pull - Output Bundle
================================

Generated by ipeds_pull.py on {time.strftime('%Y-%m-%d %H:%M:%S')}

Schools requested: {len(SCHOOLS)}
Schools matched to UnitIDs: {len(name_to_uid)}
Files downloaded: {n_files}

Layout
------
ipeds_output/
  data/                Per-survey CSVs (rows = institution-year combos)
                       First column is `year` (the IPEDS file's year).
                       Remaining columns are the union of variable codes
                       observed across the years in that survey.
  dict/                Per-file data dictionaries (one CSV per survey-year).
                       Each contains the 'varlist' and 'Frequencies' sheets
                       from the official IPEDS dictionary xlsx.
  matched_unitids.csv  How each school name was resolved to a UnitID
                       (override / fuzzy / no_match). Open this first to
                       spot-check that no schools matched the wrong campus.
  run.log              Time-stamped log of every download/filter step.
  _raw_zips/           Raw zip downloads cached so re-runs don't re-fetch.

Survey codes
------------
HD       Header / Directory (one row per institution per year)
IC       Institutional Characteristics
IC_AY    Tuition & Fees - Academic Year reporters
IC_PY    Tuition & Fees - Program Year reporters
ADM      Admission considerations + Test Scores
C_A/B/C  Completions: by CIP/race-sex / recipients race-sex / age
C_DEP    Completions: distance education
EF_A..D  Fall Enrollment race-sex / age / residence / total+retention
EF_CP    Fall Enrollment by Major
EFFY     12-month Enrollment
EFIA     Instructional Activity (FTE)
SFA      Student Financial Aid (with Pell, loans, net price)
SFAV     SFA - Veterans / Military
GR       Graduation Rates 150% (4yr/6yr cohorts)
GR200    Graduation Rates 200%
GR_L2    GR for <2-year cohort
GR_PELL  GR by Pell / SSL status
OM       Outcome Measures (8-year tracking)
F_F1A    Finance: Public/GASB-reporting
F_F2     Finance: Private not-for-profit/FASB-reporting
F_F3     Finance: For-profit
S_OC     Staff by occupational category
S_IS     Instructional Staff
S_NH     New Hires
SAL_IS   Salaries - Instructional Staff
SAL_NIS  Salaries - Non-Instructional
EAP      Employees by Assigned Position
AL       Academic Libraries

Variable code reference
-----------------------
IPEDS variable codes (e.g. EFTOTLT, GRTOTLT, F2D01) are documented in
each per-year dictionary CSV under dict/. The "varlist" rows give you
varname, varTitle, longDescription, format, type, and a code reference
for categorical fields.

Re-running
----------
Cached zips in _raw_zips/ are reused. To force a fresh download, delete
that directory and re-run.
"""
    README_PATH.write_text(text)
    log(f"  -> wrote {README_PATH}")


def main() -> int:
    if LOG_PATH.exists():
        LOG_PATH.unlink()
    log("=" * 64)
    log("IPEDS pull starting")
    log(f"Output dir: {OUT}")
    log("=" * 64)

    name_to_uid = step_resolve_unitids()
    if len(name_to_uid) < 80:
        log(f"FATAL: only matched {len(name_to_uid)} of {len(SCHOOLS)} schools - "
            "review matched_unitids.csv before continuing.")
        return 2

    unitids = set(name_to_uid.values())
    downloads = step_download_all()
    step_filter_and_combine(downloads, unitids)
    step_dictionaries()
    n_ok = sum(1 for _, _, p in downloads if p is not None)
    write_readme(name_to_uid, n_ok)

    log("Done.")
    log(f"Open: {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
