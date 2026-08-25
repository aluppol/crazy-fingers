export type BookId = string;

export interface Chapter {
  readonly title: string;
  readonly firstSymbolIndex: number;
}

export interface BookDraft {
  readonly title: string;
  readonly author: string | null;
  readonly text: string;
  readonly chapters: readonly Chapter[];
}

export interface Book extends BookDraft {
  readonly id: BookId;
  readonly addedAt: number;
}

export interface BookSummary {
  readonly id: BookId;
  readonly title: string;
  readonly author: string | null;
  readonly chapters: readonly Chapter[];
  readonly symbolCount: number;
  readonly addedAt: number;
}
