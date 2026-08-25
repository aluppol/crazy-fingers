export function directoryOf(path: string): string {
  const slashIndex = path.lastIndexOf('/');
  return slashIndex === -1 ? '' : path.slice(0, slashIndex + 1);
}

export function resolveZipPath(baseDirectory: string, reference: string): string {
  const withoutFragment = decodeURIComponent(reference.split('#')[0]);
  const joined = withoutFragment.startsWith('/') ? withoutFragment.slice(1) : `${baseDirectory}${withoutFragment}`;
  const segments: string[] = [];
  for (const segment of joined.split('/')) {
    if (segment === '..') segments.pop();
    else if (segment !== '.' && segment !== '') segments.push(segment);
  }
  return segments.join('/');
}
