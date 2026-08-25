import { strToU8, zipSync } from 'fflate';
import { SourceDocument } from '../app/application';

export function textSource(name: string, text: string): SourceDocument {
  return { name, bytes: toArrayBuffer(new TextEncoder().encode(text)) };
}

export function bytesSource(name: string, bytes: readonly number[]): SourceDocument {
  return { name, bytes: toArrayBuffer(Uint8Array.from(bytes)) };
}

export function zipSource(name: string, files: Readonly<Record<string, string>>): SourceDocument {
  const entries = Object.fromEntries(Object.entries(files).map(([path, content]) => [path, strToU8(content)]));
  return { name, bytes: toArrayBuffer(zipSync(entries)) };
}

export function squash(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  return view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength) as ArrayBuffer;
}
