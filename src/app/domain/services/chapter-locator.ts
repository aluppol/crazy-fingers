import { Chapter } from '../entities';

export function chapterIndexAt(chapters: readonly Chapter[], symbolIndex: number): number {
  const nextChapterIndex = chapters.findIndex(chapter => chapter.firstSymbolIndex > symbolIndex);
  const currentChapterIndex = nextChapterIndex === -1 ? chapters.length - 1 : nextChapterIndex - 1;
  return Math.max(currentChapterIndex, 0);
}
