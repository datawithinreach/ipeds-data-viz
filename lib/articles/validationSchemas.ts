import { z } from 'zod';

export const surveyCodeSchema = z.enum([
  'admissions',
  'tuition',
  'enrollment',
  'completions',
  'graduation',
]);

export const chartTypeSchema = z.enum(['bar', 'line', 'stackedBar', 'pie', 'heatmap', 'slope']);

export const generationParamsSchema = z.object({
  topic: z.string().optional(),
  year: z.literal('2024'),
  institutions: z.array(z.string()).min(1).max(10),
  selections: z
    .array(
      z.object({
        surveyCode: surveyCodeSchema,
        variables: z.array(z.string()).min(1).max(10),
      }),
    )
    .min(1)
    .max(5),
  angle: z.enum(['overview', 'comparison', 'trend', 'spotlight']),
  tone: z.enum(['neutral', 'analytical', 'narrative']),
  length: z.enum(['short', 'medium', 'long']),
  audience: z.enum(['general', 'student', 'policy']),
  customQuestion: z.string().max(300).optional(),
});

export const chartSpecSchema = z.object({
  id: z.string(),
  type: chartTypeSchema,
  title: z.string(),
  surveyCode: surveyCodeSchema,
  institutions: z.array(z.string()),
  variables: z.array(z.string()),
  typeOverride: chartTypeSchema.nullable().optional(),
  timeSeries: z.boolean().optional(),
});

export const sectionRoleSchema = z.enum(['context', 'comparison', 'spotlight', 'analysis', 'caveat']);

export const articleSectionSchema = z.object({
  id: z.string(),
  role: sectionRoleSchema.optional(),
  heading: z.string(),
  markdown: z.string(),
  chart: chartSpecSchema.nullable().optional(),
});

export const heroStatSchema = z.object({
  value: z.string().min(1).max(40),
  label: z.string().min(1).max(120),
  context: z.string().max(240).optional(),
});

export const articleBodySchema = z.object({
  heroStat: heroStatSchema.nullable().optional(),
  intro: z.string(),
  sections: z.array(articleSectionSchema),
  methodology: z.string().optional(),
  generationWarnings: z.array(z.string()).optional(),
});

export const articlePatchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(500).optional(),
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case')
    .optional(),
  tags: z.array(z.string()).max(10).optional(),
  category: z.string().max(80).optional(),
  body: articleBodySchema.optional(),
});

export const submitArticleSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case'),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  tags: z.array(z.string()).max(10),
  params: generationParamsSchema,
  body: articleBodySchema,
});
