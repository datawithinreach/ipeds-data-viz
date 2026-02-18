// Mock data for IPEDS-style data visualizations

export type EnrollmentDatum = {
  year: string;
  total: number;
};

export type GraduationDatum = {
  year: string;
  rate: number;
};

export type DemographicDatum = {
  label: string;
  value: number;
  color: string;
};

export type TuitionDatum = {
  year: string;
  inState: number;
  outOfState: number;
};

export type DegreeFieldDatum = {
  field: string;
  count: number;
};

// Enrollment over time
export const enrollmentData: EnrollmentDatum[] = [
  { year: '2016', total: 14200 },
  { year: '2017', total: 14500 },
  { year: '2018', total: 14850 },
  { year: '2019', total: 15100 },
  { year: '2020', total: 14800 },
  { year: '2021', total: 15300 },
  { year: '2022', total: 15600 },
  { year: '2023', total: 15900 },
  { year: '2024', total: 16200 },
];

// Graduation rates over time
export const graduationData: GraduationDatum[] = [
  { year: '2016', rate: 88 },
  { year: '2017', rate: 89 },
  { year: '2018', rate: 90 },
  { year: '2019', rate: 91 },
  { year: '2020', rate: 89 },
  { year: '2021', rate: 92 },
  { year: '2022', rate: 93 },
  { year: '2023', rate: 94 },
  { year: '2024', rate: 94 },
];

// Student demographics
export const demographicData: DemographicDatum[] = [
  { label: 'White', value: 56, color: '#334155' },
  { label: 'Asian', value: 12, color: '#0d9488' },
  { label: 'Hispanic', value: 14, color: '#6366f1' },
  { label: 'Black', value: 5, color: '#0ea5e9' },
  { label: 'International', value: 8, color: '#1e293b' },
  { label: 'Other', value: 5, color: '#64748b' },
];

// Tuition costs
export const tuitionData: TuitionDatum[] = [
  { year: '2016', inState: 42000, outOfState: 42000 },
  { year: '2017', inState: 43200, outOfState: 43200 },
  { year: '2018', inState: 44500, outOfState: 44500 },
  { year: '2019', inState: 45800, outOfState: 45800 },
  { year: '2020', inState: 46300, outOfState: 46300 },
  { year: '2021', inState: 47600, outOfState: 47600 },
  { year: '2022', inState: 49100, outOfState: 49100 },
  { year: '2023', inState: 50700, outOfState: 50700 },
  { year: '2024', inState: 52300, outOfState: 52300 },
];

// Degrees by field
export const degreeFieldData: DegreeFieldDatum[] = [
  { field: 'Business', count: 1420 },
  { field: 'Economics', count: 980 },
  { field: 'Biology', count: 860 },
  { field: 'Nursing', count: 740 },
  { field: 'Computer Sci.', count: 650 },
  { field: 'Psychology', count: 580 },
  { field: 'Communications', count: 520 },
  { field: 'Political Sci.', count: 460 },
];

// Summary statistics
export const summaryStats = {
  totalEnrollment: '16,200',
  graduationRate: '94%',
  acceptanceRate: '19%',
  avgFinancialAid: '$42,500',
  studentFacultyRatio: '12:1',
  medianEarnings: '$78,400',
};
