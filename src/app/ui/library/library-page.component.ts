import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { readSourceDocument } from '../../adapters/input';
import { DocumentImporter, Library, LibraryEntry } from '../../application';
import { BookId } from '../../domain';
import { describeError } from '../error-message';

const PASTED_TEXT_TITLE = 'Pasted text';

@Component({
  selector: 'app-library-page',
  imports: [RouterLink],
  templateUrl: './library-page.component.html',
  styleUrl: './library-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryPageComponent implements OnInit {
  public readonly entries = signal<LibraryEntry[]>([]);
  public readonly statusMessage = signal('');
  public readonly isImporting = signal(false);
  public readonly expandedBookId = signal<BookId | null>(null);
  public readonly armedDeleteBookId = signal<BookId | null>(null);
  public readonly pastedTitle = signal('');
  public readonly pastedText = signal('');
  public readonly acceptedFileTypes: string;

  private readonly _library = inject(Library);
  private readonly _importer = inject(DocumentImporter);
  private readonly _router = inject(Router);

  constructor() {
    this.acceptedFileTypes = this._importer.supportedExtensions.map(extension => `.${extension}`).join(',');
  }

  public async ngOnInit(): Promise<void> {
    await this._refresh();
  }

  public async importFiles(files: FileList | null): Promise<void> {
    const selectedFiles = files === null ? [] : Array.from(files);
    if (selectedFiles.length === 0) return;
    this.isImporting.set(true);
    const failures = await this._importEach(selectedFiles);
    this.isImporting.set(false);
    this.statusMessage.set(this._importSummary(selectedFiles.length - failures.length, failures));
    await this._refresh();
  }

  public async importPastedText(): Promise<void> {
    const title = this.pastedTitle().trim() || PASTED_TEXT_TITLE;
    try {
      await this._importer.importText(title, this.pastedText());
      this.pastedTitle.set('');
      this.pastedText.set('');
      this.statusMessage.set(`Added "${title}"`);
    } catch (error) {
      this.statusMessage.set(describeError(error));
    }
    await this._refresh();
  }

  private async _importEach(files: readonly File[]): Promise<string[]> {
    const failures: string[] = [];
    for (const file of files) {
      try {
        await this._importer.importDocument(await readSourceDocument(file));
      } catch (error) {
        failures.push(`${file.name}: ${describeError(error)}`);
      }
    }
    return failures;
  }

  private _importSummary(added: number, failures: readonly string[]): string {
    if (failures.length === 0) return `Added ${added} book(s)`;
    if (added === 0) return failures.join(' · ');
    return `Added ${added} book(s) · ${failures.join(' · ')}`;
  }

  public toggleChapters(bookId: BookId): void {
    this.expandedBookId.update(current => (current === bookId ? null : bookId));
  }

  public async openChapter(bookId: BookId, chapterIndex: number): Promise<void> {
    await this._library.moveCursorToChapter(bookId, chapterIndex);
    await this._router.navigate(['/books', bookId]);
  }

  public async deleteBook(bookId: BookId): Promise<void> {
    if (this.armedDeleteBookId() !== bookId) {
      this.armedDeleteBookId.set(bookId);
      return;
    }
    await this._library.deleteBook(bookId);
    this.armedDeleteBookId.set(null);
    await this._refresh();
  }

  public progressPercent(entry: LibraryEntry): number {
    return entry.book.symbolCount === 0 ? 0 : Math.floor((entry.symbolIndex / entry.book.symbolCount) * 100);
  }

  private async _refresh(): Promise<void> {
    this.entries.set(await this._library.listEntries());
  }
}
