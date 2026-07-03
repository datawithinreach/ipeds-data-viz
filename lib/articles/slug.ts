import crypto from 'node:crypto';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function withRandomSuffix(base: string, len = 4): string {
  const suffix = crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
  const trimmed = base.slice(0, 60 - (len + 1));
  return `${trimmed || 'draft'}-${suffix}`;
}
