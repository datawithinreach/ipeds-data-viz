import 'server-only';
import OpenAI from 'openai';
import crypto from 'node:crypto';
import type { ArticleSection, ChartSpec, CommunityArticle } from '@/lib/articles/types';
import { datasets, getInstitutionId, SURVEY_CODES } from '@/lib/articles/datasets';

export type RegenerateSectionInput = {
  article: Pick<CommunityArticle, 'title' | 'description' | 'body' | 'params'>;
  sectionId: string;
  instruction?: string;
};

const sectionSchema = {
  type: 'object' as const,
  properties: {
    heading: { type: 'string' as const },
    markdown: { type: 'string' as const },
    chart: {
      anyOf: [
        {
          type: 'object' as const,
          properties: {
            type: { type: 'string' as const, enum: ['bar', 'line', 'stackedBar'] },
            title: { type: 'string' as const },
            surveyCode: { type: 'string' as const, enum: SURVEY_CODES },
            institutions: { type: 'array' as const, items: { type: 'string' as const } },
            variables: { type: 'array' as const, items: { type: 'string' as const } },
            rationale: { type: 'string' as const },
          },
          required: ['type', 'title', 'surveyCode', 'institutions', 'variables', 'rationale'] as const,
          additionalProperties: false,
        },
        { type: 'null' as const },
      ],
    },
  },
  required: ['heading', 'markdown', 'chart'] as const,
  additionalProperties: false,
};

function dataBriefFor(article: RegenerateSectionInput['article']) {
  const out = [];
  for (const inst of article.params.institutions) {
    const unitId = getInstitutionId(inst);
    if (!unitId) continue;
    const surveys = [];
    for (const sel of article.params.selections) {
      const ds = datasets[sel.surveyCode];
      if (!ds) continue;
      const row = ds.data[String(unitId)];
      if (!row) continue;
      const values = sel.variables
        .filter((v) => row[v] !== undefined && row[v] !== '' && row[v] !== '.')
        .map((v) => ({ code: v, description: ds.variables[v] ?? v, value: row[v] }));
      if (values.length > 0) surveys.push({ surveyCode: sel.surveyCode, surveyLabel: ds.label, values });
    }
    out.push({ institution: inst, unitId: String(unitId), surveys });
  }
  return out;
}

export async function regenerateSection({ article, sectionId, instruction }: RegenerateSectionInput): Promise<ArticleSection> {
  const original = article.body.sections.find((s) => s.id === sectionId);
  if (!original) throw new Error(`Section ${sectionId} not found`);

  const otherSections = article.body.sections
    .filter((s) => s.id !== sectionId)
    .map((s) => ({ heading: s.heading, snippet: s.markdown.slice(0, 280) }));

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `You are revising one section of an IPEDS data story. Return a single section (heading + markdown + optional chart).

Rules:
- Use ONLY values from the data brief. No invented numbers.
- Institution names must match the brief verbatim.
- Keep the section consistent with the article's title, intro, and sibling sections — don't repeat what other sections already cover.
- Decide whether a chart adds insight. If yes, attach a spec; if no, set chart to null.
- Chart-type rule: line for ordered/ranked comparisons of 3+, stackedBar for parts-of-whole across institutions with ≥2 part variables, bar otherwise.
- chart.surveyCode must be one of: ${SURVEY_CODES.join(', ')}.
- The user's instruction (if any) takes priority. If empty, simply tighten and improve the existing section.`;

  const userMessage = `Article title: ${article.title}
Article description: ${article.description}
Article tone: ${article.params.tone}; audience: ${article.params.audience}; angle: ${article.params.angle}.

Other sections (for context, do not duplicate):
${JSON.stringify(otherSections, null, 2)}

Section being revised:
${JSON.stringify({ heading: original.heading, markdown: original.markdown, chart: original.chart }, null, 2)}

${instruction ? `User instruction for this revision:\n${instruction}\n` : ''}
Data brief:
${JSON.stringify(dataBriefFor(article), null, 2)}`;

  const response = await client.responses.create({
    model: 'gpt-5-mini',
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'article_section',
        schema: sectionSchema,
        strict: true,
      },
    },
  });

  const parsed = JSON.parse(response.output_text);
  const newChart: ChartSpec | null = parsed.chart
    ? {
        id: original.chart?.id ?? `chart_${crypto.randomBytes(4).toString('hex')}`,
        type: parsed.chart.type,
        title: parsed.chart.title,
        surveyCode: parsed.chart.surveyCode,
        institutions: parsed.chart.institutions,
        variables: parsed.chart.variables,
        typeOverride: original.chart?.typeOverride ?? null,
      }
    : null;

  return {
    id: original.id,
    heading: parsed.heading,
    markdown: parsed.markdown,
    chart: newChart,
  };
}
