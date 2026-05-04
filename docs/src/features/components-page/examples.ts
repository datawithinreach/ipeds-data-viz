import type { ComponentExample } from './types';

export const examples: ComponentExample[] = [
  {
    name: 'Bar Chart',
    code: `<BarChart
  title="Enrollment by Institution Type"
  data={[
    { label: 'Public', value: 4200 },
    { label: 'Private Non-Profit', value: 2100 },
    { label: 'Private For-Profit', value: 900 },
  ]}
  height={280}
/>`,
    propDocs: [
      {
        name: 'data',
        type: 'BarDatum[]',
        description: 'Required. Array of bars with label/value and optional color/group.',
      },
      { name: 'title', type: 'string', description: 'Optional chart heading.' },
      { name: 'subtitle', type: 'string', description: 'Optional supporting text under the title.' },
      { name: 'height', type: 'number', description: 'Chart height in pixels.' },
      { name: 'width', type: 'number', description: 'Optional fixed container width.' },
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        description: 'Bar direction.',
      },
      { name: 'barSize', type: 'number', description: 'Thickness of each bar.' },
      {
        name: 'defaultColor',
        type: 'string',
        description: 'Fallback bar color when a datum has no color.',
      },
      {
        name: 'contained',
        type: 'boolean',
        description: 'Applies article max-width container styling.',
      },
    ],
  },
  {
    name: 'Line Chart',
    code: `<LineChart
  title="Applications and Admissions"
  series={[
    {
      label: 'Applicants',
      data: [
        { x: '2020', y: 1200 },
        { x: '2021', y: 1350 },
        { x: '2022', y: 1580 },
        { x: '2023', y: 1490 },
        { x: '2024', y: 1720 },
      ],
    },
    {
      label: 'Admitted',
      data: [
        { x: '2020', y: 740 },
        { x: '2021', y: 810 },
        { x: '2022', y: 890 },
        { x: '2023', y: 860 },
        { x: '2024', y: 940 },
      ],
    },
  ]}
  height={300}
/>`,
    propDocs: [
      { name: 'series', type: 'LineSeries[]', description: 'Required. One or more lines to render.' },
      { name: 'title', type: 'string', description: 'Optional chart heading.' },
      { name: 'subtitle', type: 'string', description: 'Optional supporting text under the title.' },
      { name: 'height', type: 'number', description: 'Chart height in pixels.' },
      { name: 'width', type: 'number', description: 'Optional fixed container width.' },
      { name: 'showLegend', type: 'boolean', description: 'Shows/hides the legend row.' },
      {
        name: 'enableSeriesSelection',
        type: 'boolean',
        description: 'Allows toggling series visibility from the legend.',
      },
      {
        name: 'contained',
        type: 'boolean',
        description: 'Applies article max-width container styling.',
      },
    ],
  },
  {
    name: 'Histogram',
    code: `<Histogram
  title="Acceptance Rate Distribution"
  data={[
    18, 21, 22, 23, 24, 24, 25, 26, 27, 28,
    28, 29, 31, 32, 34, 35, 36, 39, 42, 45,
  ]}
  xLabel="Acceptance rate"
  yLabel="Schools"
  height={300}
/>`,
    propDocs: [
      { name: 'data', type: 'number[]', description: 'Required. Numeric observations to bin.' },
      { name: 'title', type: 'string', description: 'Optional chart heading.' },
      { name: 'subtitle', type: 'string', description: 'Optional supporting text under the title.' },
      { name: 'xLabel', type: 'string', description: 'Optional label under the x-axis.' },
      { name: 'yLabel', type: 'string', description: 'Optional label beside the y-axis.' },
      { name: 'height', type: 'number', description: 'Chart height in pixels.' },
      { name: 'width', type: 'number', description: 'Optional fixed container width.' },
      {
        name: 'binCount',
        type: 'number',
        description: 'Optional explicit number of bins.',
      },
    ],
  },
  {
    name: 'Pie Chart',
    code: `<PieChart
  title="Enrollment Share"
  data={[
    { label: 'Public', value: 62 },
    { label: 'Private Non-Profit', value: 29 },
    { label: 'Private For-Profit', value: 9 },
  ]}
  innerRadius={72}
  height={300}
/>`,
    propDocs: [
      { name: 'data', type: 'PieDatum[]', description: 'Required. Pie slices with label/value.' },
      { name: 'title', type: 'string', description: 'Optional chart heading.' },
      { name: 'subtitle', type: 'string', description: 'Optional supporting text under the title.' },
      { name: 'height', type: 'number', description: 'Chart height in pixels.' },
      { name: 'width', type: 'number', description: 'Optional fixed container width.' },
      { name: 'outerRadius', type: 'number', description: 'Optional outer pie radius in pixels.' },
      { name: 'innerRadius', type: 'number', description: 'Use > 0 to render a donut chart.' },
      { name: 'padAngle', type: 'number', description: 'Spacing between slices (radians).' },
      { name: 'showLegend', type: 'boolean', description: 'Shows/hides legend entries.' },
      {
        name: 'contained',
        type: 'boolean',
        description: 'Applies article max-width container styling.',
      },
    ],
  },
  {
    name: 'Scatterplot',
    code: `<ScatterPlot
  title="Acceptance Rate vs. Graduation Rate"
  data={[
    { label: 'College A', x: 35, y: 72 },
    { label: 'College B', x: 48, y: 64 },
    { label: 'College C', x: 55, y: 81 },
    { label: 'College D', x: 63, y: 58 },
    { label: 'College E', x: 74, y: 69 },
    { label: 'College F', x: 82, y: 77 },
  ]}
  xLabel="Acceptance rate"
  yLabel="Graduation rate"
  height={300}
/>`,
    propDocs: [
      { name: 'data', type: 'ScatterDatum[]', description: 'Required. Points with label, x, y, and optional pointRadius/pointColor.' },
      { name: 'title', type: 'string', description: 'Optional chart heading.' },
      { name: 'subtitle', type: 'string', description: 'Optional supporting text under the title.' },
      { name: 'xLabel', type: 'string', description: 'Optional label under the x-axis.' },
      { name: 'yLabel', type: 'string', description: 'Optional label beside the y-axis.' },
      { name: 'height', type: 'number', description: 'Chart height in pixels.' },
      { name: 'width', type: 'number', description: 'Optional fixed container width.' },
    ],
  },
  {
    name: 'Banner',
    code: `<Banner
  value="62%"
  label="of students attend public institutions"
/>`,
    propDocs: [
      { name: 'value', type: 'string', description: 'Required primary metric text.' },
      { name: 'label', type: 'string', description: 'Required supporting text below value.' },
      {
        name: 'accent',
        type: "'primary' | 'navbar' | 'button'",
        description: 'Optional theme variant for banner styling.',
      },
    ],
  },
];
