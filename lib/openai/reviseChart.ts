import 'server-only';
import OpenAI from 'openai';
import type { ChartSpec, SurveyCode } from '@/lib/articles/types';
import { datasets, SURVEY_CODES } from '@/lib/articles/datasets';
import institutionIds from '@/data/institution_ids.json';

export type ReviseChartInput = {
  current: ChartSpec;
  instruction: string;
};

const chartSchema = {
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
};

function knownInstitutionNames(): string[] {
  return Object.keys(institutionIds as Record<string, number>);
}

function buildSurveyCatalog(surveyCode: SurveyCode): { code: string; description: string }[] {
  const ds = datasets[surveyCode];
  return Object.entries(ds.variables).map(([code, description]) => ({ code, description }));
}

export async function reviseChart({ current, instruction }: ReviseChartInput): Promise<ChartSpec> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Provide the model with the variables available in the *current* survey AND a hint of other surveys it can switch to.
  const currentSurveyVars = buildSurveyCatalog(current.surveyCode);
  const otherSurveys = SURVEY_CODES.filter((s) => s !== current.surveyCode).map((s) => ({
    surveyCode: s,
    label: datasets[s].label,
    sampleVariables: Object.entries(datasets[s].variables).slice(0, 8).map(([code, desc]) => ({ code, description: desc })),
  }));

  const systemPrompt = `You revise an existing IPEDS chart spec based on a user's natural-language instruction. Return a complete, valid chart spec (not a diff).

Rules:
- The spec MUST be self-consistent: every variable must be a real code under the chosen surveyCode; every institution must be a real institution name.
- Choose chart type per the instruction; if the instruction is silent, keep the current type.
- If the instruction asks for variables not present in the current survey, switch surveyCode to the survey that contains them.
- "rationale" should be a one-sentence explanation of what the chart shows after the revision.
- Do not invent variable codes or institutions. If you cannot fulfill the instruction with the catalog provided, do your best with the closest match and explain in the rationale.

Allowed institutions (verbatim names): ${knownInstitutionNames().slice(0, 80).join('; ')} ... (and more — use names provided in the current spec or names matching the instruction).
`;

  const userMessage = `Current chart spec:
${JSON.stringify(current, null, 2)}

User instruction:
${instruction}

Variables available in current survey "${current.surveyCode}":
${JSON.stringify(currentSurveyVars, null, 2)}

Other surveys you may switch to (with sample variables):
${JSON.stringify(otherSurveys, null, 2)}`;

  const response = await client.responses.create({
    model: 'gpt-5-mini',
    input: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'chart_spec',
        schema: chartSchema,
        strict: true,
      },
    },
  });

  const parsed = JSON.parse(response.output_text);
  return {
    id: current.id,
    typeOverride: current.typeOverride ?? null,
    type: parsed.type,
    title: parsed.title,
    surveyCode: parsed.surveyCode,
    institutions: parsed.institutions,
    variables: parsed.variables,
  };
}
