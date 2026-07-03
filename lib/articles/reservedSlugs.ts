import 'server-only';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROUTE_RESERVED = new Set([
  'login',
  'signup',
  'generate',
  'admin',
  'about',
  'data-explorer',
  'api',
]);

let _staticArticleSlugs: Set<string> | null = null;

function getStaticArticleSlugs(): Set<string> {
  if (_staticArticleSlugs) return _staticArticleSlugs;

  const articleDir = join(process.cwd(), 'app', 'article');
  const entries = readdirSync(articleDir).filter((name) => {
    if (name.startsWith('[')) return false;
    const full = join(articleDir, name);
    return statSync(full).isDirectory();
  });

  _staticArticleSlugs = new Set(entries);
  return _staticArticleSlugs;
}

export function isReservedSlug(slug: string): boolean {
  return ROUTE_RESERVED.has(slug) || getStaticArticleSlugs().has(slug);
}
