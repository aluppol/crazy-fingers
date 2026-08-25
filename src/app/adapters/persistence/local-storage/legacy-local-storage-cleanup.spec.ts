import { removeLegacyLocalStorage } from './legacy-local-storage-cleanup';

describe('removeLegacyLocalStorage', () => {
  it('removes only the CrazyFingers_ keys of the 2021 build', () => {
    localStorage.clear();
    localStorage.setItem('CrazyFingers_score', '1');
    localStorage.setItem('CrazyFingers_fullText', 'abc');
    localStorage.setItem('unrelated', 'keep');
    removeLegacyLocalStorage(localStorage);
    expect(Object.keys(localStorage)).toEqual(['unrelated']);
  });
});
