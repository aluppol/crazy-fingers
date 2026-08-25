import { SourceDocument } from '../../application';

export async function readSourceDocument(file: File): Promise<SourceDocument> {
  return { name: file.name, bytes: await file.arrayBuffer() };
}
