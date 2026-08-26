import { FingerGuideVisibility } from '../enums';

const FINGER_GUIDE_STORAGE_KEY = 'crazy-fingers.finger-guide';

export function fingerGuideVisibilityFrom(storedValue: string | null): FingerGuideVisibility {
  return Object.values(FingerGuideVisibility).find(visibility => visibility === storedValue) ?? FingerGuideVisibility.Shown;
}

export function readFingerGuideVisibility(storage: Storage): FingerGuideVisibility {
  try {
    return fingerGuideVisibilityFrom(storage.getItem(FINGER_GUIDE_STORAGE_KEY));
  } catch {
    return FingerGuideVisibility.Shown;
  }
}

export function writeFingerGuideVisibility(storage: Storage, visibility: FingerGuideVisibility): void {
  try {
    storage.setItem(FINGER_GUIDE_STORAGE_KEY, visibility);
  } catch {
    return;
  }
}
