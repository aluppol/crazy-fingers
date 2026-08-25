import { CorruptDocumentError } from '../../../application';
import { MediaType, ParserErrorReason } from '../enums';

const ANY_NAMESPACE = '*';
const PARSER_ERROR_TAG = 'parsererror';
const BYTE_ORDER_MARK = /^\uFEFF/;
const WHITESPACE_RUN = /\s+/g;

export function parseXml(xmlText: string, documentName: string): Document {
  const parsed = new DOMParser().parseFromString(xmlText.replace(BYTE_ORDER_MARK, ''), MediaType.Xml);
  if (parsed.getElementsByTagName(PARSER_ERROR_TAG).length > 0) {
    throw new CorruptDocumentError(documentName, ParserErrorReason.MalformedXml);
  }
  return parsed;
}

export function parseHtml(htmlText: string): Document {
  return new DOMParser().parseFromString(htmlText, MediaType.Html);
}

export function childrenNamed(parent: Element, localName: string): Element[] {
  return Array.from(parent.children).filter(child => child.localName === localName);
}

export function descendantsNamed(root: Element | Document, localName: string): Element[] {
  return Array.from(root.getElementsByTagNameNS(ANY_NAMESPACE, localName));
}

export function firstDescendantNamed(root: Element | Document, localName: string): Element | null {
  return descendantsNamed(root, localName).at(0) ?? null;
}

export function plainTextOf(node: Node | null): string {
  return (node?.textContent ?? '').replace(WHITESPACE_RUN, ' ').trim();
}
