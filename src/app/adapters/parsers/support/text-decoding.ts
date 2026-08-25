import { TextEncodingLabel } from '../enums';

const UTF8_BOM = [0xEF, 0xBB, 0xBF];
const UTF16_LITTLE_ENDIAN_BOM = [0xFF, 0xFE];
const UTF16_BIG_ENDIAN_BOM = [0xFE, 0xFF];

export function decodeText(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  if (startsWith(view, UTF8_BOM)) return new TextDecoder(TextEncodingLabel.Utf8).decode(view);
  if (startsWith(view, UTF16_LITTLE_ENDIAN_BOM)) return new TextDecoder(TextEncodingLabel.Utf16LittleEndian).decode(view);
  if (startsWith(view, UTF16_BIG_ENDIAN_BOM)) return new TextDecoder(TextEncodingLabel.Utf16BigEndian).decode(view);
  return decodeUtf8OrFallback(view);
}

function startsWith(view: Uint8Array, byteOrderMark: readonly number[]): boolean {
  return byteOrderMark.every((byte, index) => view[index] === byte);
}

function decodeUtf8OrFallback(view: Uint8Array): string {
  try {
    return new TextDecoder(TextEncodingLabel.Utf8, { fatal: true }).decode(view);
  } catch {
    return new TextDecoder(TextEncodingLabel.Windows1251).decode(view);
  }
}
