import 'server-only';
import OpenAI from 'openai';
import crypto from 'node:crypto';
import type { GenerationParams, ArticleBody, ArticleSection, ChartSpec, SurveyCode, HeroStat } from '@/lib/articles/types';
import { datasets, getInstitutionId, SURVEY_CODES } from '@/lib/articles/datasets';
import { computeInsights, renderInsightsForPrompt } from './computeInsights';
import { validateGeneratedArticle } from '@/lib/articles/articleValidator';

const LENGTH_GUIDE: Record<string, { words: number; sections: number }> = {
  short: { words: 350, sections: 2 },
  medium: { words: 650, sections: 3 },
  long: { words: 1100, sections: 4 },
};

const ROLE_VALUES = ['context', 'comparison', 'spotlight', 'analysis', 'caveat'] as const;

type DataBriefEntry = {
  institution: string;
  unitId: string;
  surveys: { surveyCode: SurveyCode; surveyLabel: string; values: { code: string; description: string; value: string }[] }[];
};

function buildDataBrief(params: GenerationParams): DataBriefEntry[] {
  const out: DataBriefEntry[] = [];
  for (const instName of params.institutions) {
    const unitId = getInstitutionId(instName);
    if (!unitId) continue;
    const surveysOut: DataBriefEntry['surveys'] = [];
    for (const sel of params.selections) {
      const ds = datasets[sel.surveyCode];
      if (!ds) continue;
      const row = ds.data[String(unitId)];
      if (!row) continue;
      const values: { code: string; description: string; value: string }[] = [];
      for (const v of sel.variables) {
        const raw = row[v];
        if (raw === undefined || raw === '' || raw === '.') continue;
        values.push({ code: v, description: ds.variables[v] ?? v, value: raw });
      }
      if (values.length > 0) surveysOut.push({ surveyCode: sel.surveyCode, surveyLabel: ds.label, values });
    }
    out.push({ institution: instName, unitId: String(unitId), surveys: surveysOut });
  }
  return out;
}

const bodyJsonSchema = {
  type: 'object' as const,
  properties: {
    title: { type: 'string' as const },
    description: { type: 'string' as const },
    tags: { type: 'array' as const, items: { type: 'string' as const } },
    heroStat: {
      anyOf: [
        {
          type: 'object' as const,
          properties: {
            value: { type: 'string' as const },
            label: { type: 'string' as const },
            context: { type: 'string' as const },
          },
          required: ['value', 'label', 'context'] as const,
          additionalProperties: false,
        },
        { type: 'null' as const },
      ],
    },
    intro: { type: 'string' as const },
    sections: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          role: { type: 'string' as const, enum: ROLE_VALUES },
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
        required: ['role', 'heading', 'markdown', 'chart'] as const,
        additionalProperties: false,
      },
    },
    methodology: { type: 'string' as const },
  },
  required: ['title', 'description', 'tags', 'heroStat', 'intro', 'sections', 'methodology'] as const,
  additionalProperties: false,
};

export type GenerationResult = {
  title: string;
  description: string;
  tags: string[];
  body: ArticleBody;
  /** Validator findings — non-blocking; surfaced to the editor for transparency. */
  warnings: string[];
};

function makeId(prefix: string) {
  return `${prefix}_${crypto.randomBytes(4).toString('hex')}`;
}

function normalizeTags(raw: string[]): string[] {
  const out = new Set<string>();
  for (const t of raw) {
    const k = t
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (k && k.length <= 30) out.add(k);
    if (out.size >= 6) break;
  }
  return Array.from(out);
}

export async function generateArticle(params: GenerationParams): Promise<GenerationResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const dataBrief = buildDataBrief(params);
  const insights = computeInsights(params);
  const guide = LENGTH_GUIDE[params.length] ?? LENGTH_GUIDE.medium;

  const systemPrompt = `You are a senior data journalist for "Inside College Data", an editorial publication on US higher education. You write tight, evidence-driven stories using IPEDS data.

# Voice and house style (strict)
- Concrete numbers in every paragraph. No vague qualifiers ("many", "several", "various").
- Never use these AI-tell phrases: "delve", "dive into", "in conclusion", "in summary", "it's important to note", "in today's world", "navigate the landscape", "moreover", "furthermore", "in essence".
- Sentence-case section headings (e.g. "A 20-point gap among schools that admit similar shares"). Not Title Case. Not all caps.
- Don't restate the title in the intro. Don't end with a "wrap up" paragraph that says nothing new — let the last data point be the kicker.
- Cite every number to its source institution. Round consistently (rates to one decimal, dollar amounts to whole dollars, counts as integers).
- Avoid passive voice. Avoid the word "showcase".
- One idea per paragraph. Two to four sentences each.

# Article structure (this length: ${params.length} → exactly ${guide.sections} sections, ~${guide.words} words total)
1. heroStat — a single data point that frames the entire piece. value: pretty-printed (e.g. "3.6%", "$59,750"). label: ≤80 char caption that names the thing and the school. context: one sentence saying why it matters.
2. intro — 2–4 short sentences. Lead with the most striking finding from the insights. Don't restate the data brief; interpret it.
3. sections — exactly ${guide.sections}. Each section has a role drawn from: context (frame the comparison), comparison (the main analytical chart), spotlight (a single institution), analysis (what the numbers imply), caveat (limits / caveats / what's missing).
4. methodology — 2–4 sentences in markdown citing IPEDS, the survey codes used, and any computed metrics (e.g., admit rate = ADMSSN ÷ APPLCN). End with the year(s) covered.

# Hard data rules (will be auto-rejected if violated)
- Use ONLY values from the data brief. Never invent or estimate. If you state a percentage that's not in the brief, recompute it explicitly from values that are.
- Institution names verbatim from the brief. No nicknames, no shortenings.
- Tags: 3–6 lowercase-kebab tags. No "data", "analysis", "ipeds" — too generic.
- Description: 110–160 chars. Plain English. No "this article…".
- Title: ≤90 chars. Use a hook + clarifier pattern when natural ("Yield is the new selectivity: Ivy League conversion rates, 2023–24"). Avoid generic forms ("A look at...", "Comparing X and Y").

# Chart rules
Every section may attach exactly one chart (or null if none adds insight). Each chart needs:
- type: line for ordered/ranked comparisons of 3+, stackedBar for parts-of-whole with ≥2 part variables, bar otherwise.
- surveyCode: must be one of ${SURVEY_CODES.join(', ')}.
- variables: every code must appear in the data brief under that survey.
- institutions: every name must appear in the brief.
- rationale: one sentence on what the reader learns from this chart.
NEVER chart admission-consideration codes (ADMCON1-12 — they're categorical flags). NEVER mix counts and percentages on the same chart unless using stackedBar. Funnel variables (APPLCN/ADMSSN/ENRLT) belong on a single chart, not split. Prefer rate variables (codes containing _RATE_PCT) over raw counts when the framing is selectivity, yield, or share.`;

  const userMessage = `Write the article for the parameters below.

# Editorial framing
- Angle: ${params.angle}
- Tone: ${params.tone}
- Audience: ${params.audience}
${params.customQuestion ? `- The article must answer: "${params.customQuestion}"` : ''}

# Data brief
${JSON.stringify(dataBrief, null, 2)}

${renderInsightsForPrompt(insights)}

Now write the article matching the schema exactly.`;

  const response = await client.responses.create({
    model: 'gpt-5-mini',
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'article_body',
        schema: bodyJsonSchema,
        strict: true,
      },
    },
  });

  const parsed = JSON.parse(response.output_text);

  const sections: ArticleSection[] = (parsed.sections as ArticleSection[]).map((s) => {
    const sectionId = makeId('sec');
    let chart: ChartSpec | null = null;
    if (s.chart) {
      chart = { ...(s.chart as ChartSpec), id: makeId('chart') };
    }
    return {
      id: sectionId,
      role: s.role,
      heading: s.heading,
      markdown: s.markdown,
      chart,
    };
  });

  const heroStat: HeroStat | null = parsed.heroStat
    ? {
        value: parsed.heroStat.value,
        label: parsed.heroStat.label,
        context: parsed.heroStat.context,
      }
    : null;

  const body: ArticleBody = {
    heroStat,
    intro: parsed.intro,
    sections,
    methodology: parsed.methodology,
  };

  const warnings = validateGeneratedArticle({
    params,
    body,
    title: parsed.title,
    description: parsed.description,
    tags: parsed.tags,
    expectedSections: guide.sections,
  });

  return {
    title: parsed.title,
    description: parsed.description,
    tags: normalizeTags(parsed.tags ?? []),
    body,
    warnings,
  };
}
