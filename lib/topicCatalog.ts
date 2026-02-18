export type TopicGroup = {
  heading: string;
  links: TopicLink[];
};

export type TopicLink = {
  label: string;
  slug: string;
  href: string;
  category: 'enrollment' | 'costs' | 'outcomes' | 'campus' | 'academics';
};

const baseTopics: Omit<TopicLink, 'href'>[] = [
  {
    label: 'Fall Enrollment',
    slug: 'fall-enrollment',
    category: 'enrollment',
  },
  {
    label: 'Admissions & Test Scores',
    slug: 'admissions-test-scores',
    category: 'enrollment',
  },
  {
    label: 'Retention Rates',
    slug: 'retention-rates',
    category: 'enrollment',
  },
  {
    label: 'Tuition & Fees',
    slug: 'tuition-fees',
    category: 'costs',
  },
  {
    label: 'Financial Aid',
    slug: 'financial-aid',
    category: 'costs',
  },
  {
    label: 'Net Price',
    slug: 'net-price',
    category: 'costs',
  },
  {
    label: 'Graduation Rates',
    slug: 'graduation-rates',
    category: 'outcomes',
  },
  {
    label: 'Post-Graduation Earnings',
    slug: 'post-graduation-earnings',
    category: 'outcomes',
  },
  {
    label: 'Student Loan Debt',
    slug: 'student-loan-debt',
    category: 'outcomes',
  },
  {
    label: 'Student Demographics',
    slug: 'student-demographics',
    category: 'campus',
  },
  {
    label: 'Faculty & Staff',
    slug: 'faculty-staff',
    category: 'campus',
  },
  {
    label: 'Institutional Characteristics',
    slug: 'institutional-characteristics',
    category: 'campus',
  },
  {
    label: 'Degrees & Certificates',
    slug: 'degrees-certificates',
    category: 'academics',
  },
  {
    label: 'Programs Offered',
    slug: 'programs-offered',
    category: 'academics',
  },
  {
    label: 'Research Expenditures',
    slug: 'research-expenditures',
    category: 'academics',
  },
];

const withHrefs = baseTopics.map((topic) => ({
  ...topic,
  href: `/topics/${topic.slug}`,
}));

export const topicsByGroup: TopicGroup[] = [
  {
    heading: 'Enrollment & Admissions',
    links: withHrefs.filter((topic) => topic.category === 'enrollment'),
  },
  {
    heading: 'Costs & Financial Aid',
    links: withHrefs.filter((topic) => topic.category === 'costs'),
  },
  {
    heading: 'Outcomes',
    links: withHrefs.filter((topic) => topic.category === 'outcomes'),
  },
  {
    heading: 'Campus & Students',
    links: withHrefs.filter((topic) => topic.category === 'campus'),
  },
  {
    heading: 'Academics',
    links: withHrefs.filter((topic) => topic.category === 'academics'),
  },
];

export const topicLinks = withHrefs;

export const topicBySlug = Object.fromEntries(
  topicLinks.map((topic) => [topic.slug, topic])
) as Record<string, TopicLink>;
