const LEGACY_KEY_PREFIX = 'CrazyFingers_';

export function removeLegacyLocalStorage(storage: Storage): void {
  Object.keys(storage)
    .filter(key => key.startsWith(LEGACY_KEY_PREFIX))
    .forEach(key => storage.removeItem(key));
}
