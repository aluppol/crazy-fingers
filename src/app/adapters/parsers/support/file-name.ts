export function extensionOf(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex === -1 ? '' : fileName.slice(dotIndex + 1).toLowerCase();
}

export function titleFromFileName(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  const stem = dotIndex <= 0 ? fileName : fileName.slice(0, dotIndex);
  return stem.replace(/_/g, ' ').trim() || fileName;
}
