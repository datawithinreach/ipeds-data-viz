# IPEDS data pull — what this is and how to run it

You asked me to grab IPEDS data for the 102 US News–ranked schools in your
list. The Cowork sandbox can't reach `nces.ed.gov` (NCES is not on the
allowlist), and `web_fetch` only works for HTML pages, not the binary zip
files NCES hosts. So I built a self-contained Python script you run on your
Mac instead. It needs no extra packages — Python 3 ships with macOS.

## How to run

Open Terminal and paste:

```bash
cd ~/ipeds-data-viz-genai-edition
python3 ipeds_pull.py
```

Expected runtime: **5–15 minutes** depending on your connection.

You'll see live progress per file. Output lands in `ipeds_output/`.

## What you get

```
ipeds_output/
├── data/                  per-survey CSVs (rows = institution-year combos)
│   ├── HD.csv             directory (name, address, control, Carnegie class)
│   ├── IC.csv             institutional characteristics
│   ├── IC_AY.csv          tuition & fees
│   ├── ADM.csv            admissions + test scores
│   ├── C_A.csv            completions by CIP/race/sex
│   ├── EF_A.csv           fall enrollment by race/sex
│   ├── EF_D.csv           fall enrollment + retention
│   ├── SFA.csv            financial aid + net price
│   ├── GR.csv             graduation rates (150%)
│   ├── OM.csv             outcome measures
│   ├── F_F1A.csv          finance — public schools (GASB)
│   ├── F_F2.csv           finance — private not-for-profit (FASB)
│   ├── S_OC.csv           HR — staff by occupation
│   ├── EAP.csv            employees by assigned position
│   ├── AL.csv             academic libraries
│   └── … 30 files total covering every IPEDS survey component
├── dict/                  one CSV per survey-year — variable code → label
│                          (parsed from the official IPEDS xlsx dictionaries)
├── matched_unitids.csv    OPEN THIS FIRST to verify the 102 name → UnitID
│                          mapping (multi-campus schools are hardcoded; the
│                          rest fuzzy-match against the IPEDS directory)
├── run.log                full timestamped log of every download/filter step
└── _raw_zips/             cached raw zips so re-runs don't re-download
```

## Coverage

- **Years**: last 5 final-release years per survey (most surveys 2019‑20
  through 2023‑24; Completions/Finance/SFA/AL through 2022‑23, Graduation
  Rates through 2024).
- **Surveys**: every IPEDS survey component (HD, IC, IC_AY/PY, ADM, C, EF,
  EFFY, EFIA, SFA, SFAV, GR, GR200, OM, F, S, SAL, EAP, AL) — 30 distinct
  file types × 5 years ≈ 150 raw zip files, filtered down to your 102 schools.

## What to check after it runs

1. **`matched_unitids.csv`** — every row should have a UnitID and the
   `matched_instnm` should be the right campus. If anything says
   `no_match`, drop it into the `UNITID_OVERRIDES` dict at the top of
   `ipeds_pull.py` and re-run.
2. **Spot-check a school you know.** E.g., open `data/HD.csv`, filter to
   UnitID 164924 (Boston College), confirm city = Chestnut Hill, MA across
   the 5 years.
3. **Spot-check finance.** Boston College is private not-for-profit so
   it'll appear in `F_F2.csv` not `F_F1A.csv`. Public flagships (Berkeley,
   Michigan, UVA) appear in `F_F1A.csv`.

## Troubleshooting

- *"FATAL: could not download HD2023.zip"* → no internet, or NCES
  temporarily down. Try again in a few minutes.
- *Some surveys missing for some years* → expected. NCES doesn't release
  every survey for every year on the same calendar; the script logs each
  miss. Check `run.log`.
- *Re-run is faster* — cached zips in `_raw_zips/` get reused. Delete that
  folder to force a fresh pull.

## If you want different scope

Edit the top of `ipeds_pull.py`:
- **Different schools**: replace the `SCHOOLS` list. If a school is at a
  multi-campus system, also add to `UNITID_OVERRIDES`.
- **More years**: extend each year list in the `FILES` table. IPEDS final
  release goes back to 2003-04 for most surveys.
- **Drop surveys**: comment out rows in the `FILES` table.
