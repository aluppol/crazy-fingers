import { Provider } from '@angular/core';
import { IndexedDbBookRepository, IndexedDbProgressRepository, openLibraryDatabase } from '../adapters/persistence';
import { CryptoIdGenerator, SystemClock } from '../adapters/platform';
import { DocumentImporter, Library } from '../application';
import { BookAssembler, ChapterSplitter, TextNormalizer } from '../domain';
import { documentParser } from './document-parsers';

const DATABASE_NAME = 'crazy-fingers';

const database = openLibraryDatabase(DATABASE_NAME);
const bookRepository = new IndexedDbBookRepository(database);
const progressRepository = new IndexedDbProgressRepository(database);
const bookAssembler = new BookAssembler(new TextNormalizer(), new ChapterSplitter());
const clock = new SystemClock();

export const applicationProviders: Provider[] = [
  { provide: Library, useValue: new Library(bookRepository, progressRepository, clock) },
  {
    provide: DocumentImporter,
    useValue: new DocumentImporter(documentParser, bookAssembler, bookRepository, new CryptoIdGenerator(), clock),
  },
];
