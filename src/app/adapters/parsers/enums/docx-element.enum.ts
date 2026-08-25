export enum DocxElement {
  Style = 'style',
  Name = 'name',
  Paragraph = 'p',
  ParagraphStyle = 'pStyle',
  Run = 'r',
  Text = 't',
  Tab = 'tab',
  Break = 'br',
  Title = 'title',
  Creator = 'creator',
}

export enum DocxAttribute {
  Value = 'w:val',
  StyleId = 'w:styleId',
}

export enum DocxPath {
  Document = 'word/document.xml',
  Styles = 'word/styles.xml',
  CoreProperties = 'docProps/core.xml',
}
