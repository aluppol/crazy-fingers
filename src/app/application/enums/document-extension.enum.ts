export enum DocumentExtension {
  PlainText = 'txt',
  PlainTextLong = 'text',
  Markdown = 'md',
  MarkdownLong = 'markdown',
  Html = 'html',
  HtmlShort = 'htm',
  Xhtml = 'xhtml',
  Epub = 'epub',
  FictionBook = 'fb2',
  Docx = 'docx',
  Pdf = 'pdf',
}

export function toDocumentExtension(value: string): DocumentExtension | undefined {
  return Object.values(DocumentExtension).find(extension => extension === value);
}
