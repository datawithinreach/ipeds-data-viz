import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

const INPUT_DATE_FORMAT = 'MM-DD-YYYY';
const OUTPUT_DATE_FORMAT = 'MMMM YYYY';

function parseDate(value?: string) {
  if (!value) return null;
  const parsed = dayjs(value, INPUT_DATE_FORMAT, true);
  return parsed.isValid() ? parsed : null;
}

export function formatArticleDate(value?: string): string {
  const parsed = parseDate(value);
  if (!parsed) return value ?? '';
  return parsed.format(OUTPUT_DATE_FORMAT).toLowerCase();
}

export function toSortableTimestamp(value?: string): number {
  const parsed = parseDate(value);
  if (!parsed) return Number.NEGATIVE_INFINITY;
  return parsed.valueOf();
}
