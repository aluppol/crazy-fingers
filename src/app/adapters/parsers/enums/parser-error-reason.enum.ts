export enum ParserErrorReason {
  NotAZipArchive = 'not a zip archive',
  MalformedXml = 'malformed XML',
  NoRootfile = 'container.xml names no rootfile',
  UnreadablePdf = 'unreadable PDF',
}
