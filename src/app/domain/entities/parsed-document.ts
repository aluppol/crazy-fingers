export interface DocumentSection {
  readonly title: string | null;
  readonly text: string;
}

export interface ParsedDocument {
  readonly title: string;
  readonly author: string | null;
  readonly sections: readonly DocumentSection[];
}
