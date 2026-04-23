export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function withBasePath(src: string) {
  if (!src) return src;

  // Absolute / special URLs should be left alone.
  if (
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('data:') ||
    src.startsWith('blob:')
  ) {
    return src;
  }

  if (basePath && (src === basePath || src.startsWith(`${basePath}/`))) {
    return src;
  }

  // For GitHub Pages (or any basePath deployment), public assets referenced as
  // `/foo.png` must become `/<basePath>/foo.png`.
  if (src.startsWith('/')) {
    return `${basePath}${src}`;
  }

  return src;
}
