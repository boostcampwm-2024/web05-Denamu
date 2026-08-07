export function canonicalizeUrl(url: string): string {
  const index = url.indexOf('/objects/');
  return index === -1 ? url : url.slice(index);
}
