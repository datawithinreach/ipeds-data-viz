# Data Source Comparison: College Scorecard, Urban Institute API, and CSV

**TL;DR** College Scorecard and the Urban Institute Education Data API both serve U.S. higher education data for thousands of Title IV institutions, drawing on IPEDS plus other federal sources—with the Urban API also including Scorecard data and adding crime, athletics, endowments, and aggregate endpoints. The CSV approach uses IPEDS institution profiles: you download one college at a time and merge CSVs yourself, which is flexible for a custom cohort but labor-intensive for national coverage. Each option has tradeoffs in coverage, bulk access, and built-in summaries. For a visualization website that covers **all colleges**, the recommended approach is the **Urban Institute Education Data API**—no API key, up to 10,000 results per page (so you can load all schools in one or a few requests), and built-in summary/aggregate endpoints for state- or sector-level charts.

---

## 1. College Scorecard

College Scorecard is the U.S. Department of Education’s public tool for comparing colleges on cost, financial aid, graduation, and post-college earnings.

### Where the data comes from

**College Scorecard** is curated by the U.S. Department of Education. It combines:

- **IPEDS** — enrollment, admissions, cost, completion, etc.
- **Treasury/IRS** — earnings outcomes (for students who received federal aid).
- **FSA (Federal Student Aid)** — federal loan and repayment data.

The API serves data for ~6,500+ Title IV institutions.

### Pros

- Official federal source; well-maintained and documented.
- Free API key; stable base URL and field names.
- Includes earnings and debt/repayment metrics not in raw IPEDS.
- Single endpoint can return many fields per school (name, admissions, cost, size, etc.).

### Cons

- **API key required** (free registration at [api.data.gov](https://api.data.gov)).
- **100 results per page** — bulk downloads need many requests (e.g., 65+ for all schools).
- **No aggregate/summary endpoints** — no built-in averages or group-by (e.g., by state).
- **1–3 years behind** — most recent core data is 2022–23.
- **Missing:** student-faculty ratio, campus crime (Clery), athletics (EADA), endowments (NACUBO).
- **Earnings bias:** earnings and repayment only cover students who received federal aid; earnings reference year is pandemic-affected (e.g., 2020, inflation-adjusted).
- **Suppressed values:** small cohorts often return null for privacy.

### Topics for articles and visualizations

- **Cost and affordability** — Tuition and fees over time; in-state vs. out-of-state; net price by income band.
- **Admissions and selectivity** — Admission rates, SAT/ACT ranges, and enrollment yields; comparisons by sector or state.
- **Completion and outcomes** — Graduation rates (overall, by cohort); time to degree; transfer outcomes.
- **Earnings and ROI** — Median earnings by institution or program; earnings vs. debt; comparison to high-school-only earnings.
- **Debt and repayment** — Median debt at graduation; repayment rates; default rates by sector or region.
- **Enrollment and size** — Student body size; part-time vs. full-time; first-time vs. continuing/transfer.
- **Geographic and sector comparisons** — State-level or Carnegie classification comparisons; public vs. private; for-profit vs. nonprofit.
- **Field-of-study outcomes** — Earnings and debt by program (where available in Scorecard).

### Example request and response

**Request — Boston College admissions + cost**

```
GET https://api.data.gov/ed/collegescorecard/v1/schools?api_key=YOUR_KEY&school.name=Boston%20College&fields=school.name,school.state,latest.admissions.admission_rate.overall,latest.cost.tuition.in_state,latest.cost.tuition.out_of_state,latest.student.size
```

**Response**

```json
{
  "metadata": { "total": 1, "page": 0, "per_page": 20 },
  "results": [
    {
      "school.name": "Boston College",
      "school.state": "MA",
      "latest.admissions.admission_rate.overall": 0.17,
      "latest.cost.tuition.in_state": 62950,
      "latest.cost.tuition.out_of_state": 62950,
      "latest.student.size": 9484
    }
  ]
}
```

---

## 2. Urban Institute Education Data API

The Urban Institute Education Data API is a free, no-key-required API that combines IPEDS, College Scorecard, and other federal education datasets for research and applications.

### Where the data comes from

The **Urban Institute Education Data API** is maintained by the Urban Institute. It aggregates:

- **IPEDS** — same core surveys as Scorecard.
- **College Scorecard** — included as a source, so Scorecard data is a subset.
- **FSA Title IV** — federal aid data.
- **EADA** — athletics (Equity in Athletics Disclosure Act).
- **NACUBO** — endowment data.
- **Campus Crime** — Clery Act data.

So it is a superset of College Scorecard, with extra dimensions (e.g., student-faculty ratio, crime, athletics, endowments) and summary/aggregate endpoints.

### Pros

- **No API key** required.
- **Up to 10,000 results per page** — much better for bulk downloads.
- **Summary/aggregate endpoints** — `stat=avg`, `median`, `sum` and `group_by` (e.g., by state FIPS) for quick comparisons.
- **Broader coverage** — student-faculty ratio, campus crime, athletics, endowments.
- **Multiple endpoints** — can build rich profiles by joining on `unitid`.

### Cons

- **Slightly older** on some metrics (e.g., tuition/aid sometimes stop at 2021).
- **No uptime SLA** — grant-funded project.
- **Joining by `unitid`** — building a full school profile may require several requests and client-side joins.
- **Same IPEDS limitations** — data 1–2 years stale; suppressed values; federal-aid bias where applicable.
- **Earnings** — same pandemic-affected reference period and federal-aid coverage as Scorecard where used.

### Topics for articles and visualizations

- **All College Scorecard–style topics** — Cost, admissions, completion, earnings, debt (same underlying data plus Scorecard); use when you need bulk or aggregate queries.
- **State and sector aggregates** — Average or median tuition, enrollment, or aid by state (FIPS) or sector via `group_by` and `stat=avg|median|sum`.
- **Student–faculty ratio** — Comparisons across institutions or states; relationship to selectivity or cost.
- **Campus safety** — Clery Act crime statistics; trends over time; comparisons by sector or region.
- **Athletics (EADA)** — Spending and participation by sport and gender; equity gaps; athletics vs. academic spending.
- **Endowments (NACUBO)** — Endowment size and spending; comparison to tuition revenue or operating budget; public vs. private.
- **Multi-metric institution profiles** — Dashboards that combine admissions, cost, crime, athletics, and endowments by joining endpoints on `unitid`.
- **Time series and year-over-year** — Same metrics across multiple IPEDS years for trend charts and before/after policy or events.

### Example requests and responses

**Request — Boston College admissions/enrollment (unitid 164924)**

```
GET https://educationdata.urban.org/api/v1/college-university/ipeds/admissions-enrollment/2022/?unitid=164924
```

**Response**

```json
{
  "results": [
    {
      "unitid": 164924,
      "year": 2022,
      "number_applied": 40474,
      "number_admitted": 6862,
      "number_enrolled_ft": 2350,
      "number_enrolled_pt": 9,
      "number_applied_men": 17457,
      "number_admitted_men": 2817,
      "number_applied_women": 23017,
      "number_admitted_women": 4045
    }
  ]
}
```

**Request — Average tuition by state (summary endpoint)**

```
GET https://educationdata.urban.org/api/v1/college-university/ipeds/academic-year-tuition/2021/?stat=avg&var=tuition_fees_ft&group_by=fips
```

**Response**

```json
{
  "results": [
    { "fips": 1, "avg_tuition_fees_ft": 12483 },
    { "fips": 6, "avg_tuition_fees_ft": 18721 },
    { "fips": 25, "avg_tuition_fees_ft": 22340 }
  ]
}
```

> **Note:** Actual responses may include extra metadata (`next`, `count`) and more columns per record.

---

## 3. CSV Approach (IPEDS website)

The IPEDS institution profile pages on the NCES website let you view and download each college’s data as CSV (one college per profile); you can then combine CSVs from several colleges into a custom dataset for analysis and visualization.

### Where the data comes from

Data comes directly from **NCES IPEDS** via the institution profile pages on the web. You download **one college at a time** from URLs of the form:

- **Institution profile:**  
  `https://nces.ed.gov/ipeds/institution-profile/164924`  
  (Replace `164924` with the IPEDS **Unit ID** for each institution.)

From each profile you can access tables and download options (including CSV where offered) for that single institution. There is no single bulk CSV of all colleges; you download each college profile separately, then merge the CSVs yourself to analyze multiple schools together.

### Pros

- **No API key** or rate limits from an API.
- **Direct from NCES** — same underlying source as the two APIs.
- **Full control over cohort** — choose exactly which colleges to include (e.g., a peer set, a state, or a custom list).
- **Institution-level detail** — you see exactly what IPEDS publishes for each school.
- **Works well for a defined set of schools** — once CSVs are downloaded and combined, you can build all visualizations from your merged dataset.

### Cons

- **One college at a time** — no bulk download; gathering many schools is manual or requires custom automation.
- **No structured API** — no consistent JSON; you work with web pages and whatever CSV/export NCES provides per page.
- **Joining and cleaning** — you must merge and normalize CSVs from multiple colleges (consistent columns, units, and IDs) yourself.
- **Same data lag and suppression** as IPEDS (1–3 years behind; suppressed cells for small cohorts).
- **No built-in aggregates** — averages by state or sector must be computed from your combined CSVs.
- **Earnings and federal-aid outcomes** — not on the basic IPEDS institution profile; those come from Scorecard/Urban (or other NCES tools).

### Topics for articles and visualizations (assuming CSVs from several colleges)

- **Peer or cohort comparisons** — Bar charts, tables, or small rankings comparing your chosen colleges on enrollment, tuition, completion, or other IPEDS metrics.
- **Scatter and relationship plots** — e.g., tuition vs. completion rate, or size vs. admission rate, across your set of schools.
- **State or region focus** — Compare colleges within one state (or a few) using only the CSVs you downloaded for that geography.
- **Sector or type comparisons** — Public vs. private, or by Carnegie classification, within your custom cohort.
- **Trends over time** — If you download multiple years per college, line charts or small multiples showing how each school changed on key metrics.
- **Single-school spotlights with context** — Deep dive on one institution with comparison bars or benchmarks drawn from the rest of your CSV cohort.
- **Transparency and sourcing** — Every number can be traced to the official IPEDS profile (link by Unit ID); good for data literacy and fact-checking pieces.

### Summary

Use the CSV approach when you want a custom set of colleges and are willing to download and merge profiles yourself. Once you have CSVs from several colleges combined, you can support the same kinds of comparative and single-school articles and visualizations as the APIs, with full control over which institutions are included. For very large or national-scale coverage, the College Scorecard or Urban Institute APIs are more practical; use Urban when you need crime, athletics, endowments, or pre-built aggregates.
