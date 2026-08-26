import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { Finger, KeyboardLayout, KeyCode } from '../enums';
import { hintFor, KeyHint } from './key-hint';
import { KEY_UNITS_PER_ROW, KEYBOARD_LAYOUTS, KeyCap } from './keyboard-layouts';

interface GuideState {
  readonly hint: KeyHint | null;
  readonly layout: KeyboardLayout;
}

const LAYOUT_BADGES: Readonly<Record<KeyboardLayout, string>> = {
  [KeyboardLayout.Latin]: 'EN',
  [KeyboardLayout.Cyrillic]: 'RU',
};

const FINGER_NAMES: Readonly<Record<Finger, string>> = {
  [Finger.LeftPinky]: 'left pinky',
  [Finger.LeftRing]: 'left ring finger',
  [Finger.LeftMiddle]: 'left middle finger',
  [Finger.LeftIndex]: 'left index finger',
  [Finger.Thumb]: 'thumb',
  [Finger.RightIndex]: 'right index finger',
  [Finger.RightMiddle]: 'right middle finger',
  [Finger.RightRing]: 'right ring finger',
  [Finger.RightPinky]: 'right pinky',
};

const SPOKEN_KEY_NAMES: ReadonlyMap<string, string> = new Map([
  [' ', 'Space'],
  ['\n', 'Enter'],
]);

const HOME_ANCHOR_CODES: ReadonlySet<KeyCode> = new Set([KeyCode.KeyF, KeyCode.KeyJ]);

function nextGuideState(symbol: string, previousLayout: KeyboardLayout): GuideState {
  const hint = hintFor(symbol, previousLayout);
  return { hint, layout: hint?.layout ?? previousLayout };
}

@Component({
  selector: 'app-keyboard-guide',
  templateUrl: './keyboard-guide.component.html',
  styleUrl: './keyboard-guide.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KeyboardGuideComponent {
  public readonly fingers = Finger;
  public readonly keyUnitsPerRow = KEY_UNITS_PER_ROW;
  public readonly symbol = input.required<string>();
  public readonly rejected = input(false);
  public readonly layoutMismatch = input(false);

  private readonly _state = linkedSignal<string, GuideState>({
    source: this.symbol,
    computation: (symbol, previous) => nextGuideState(symbol, previous?.value.layout ?? KeyboardLayout.Latin),
  });

  public readonly hint = computed(() => this._state().hint);
  public readonly layout = computed(() => this._state().layout);
  public readonly rows = computed(() => KEYBOARD_LAYOUTS[this.layout()]);
  public readonly badge = computed(() => LAYOUT_BADGES[this.layout()]);
  public readonly switchNotice = computed(() => `Switch your system keyboard layout to ${this.badge()}`);

  public readonly litFingers = computed(() => {
    const hint = this.hint();
    if (hint === null) return new Set<Finger>();
    return new Set(hint.shift === null ? [hint.finger] : [hint.finger, hint.shift.finger]);
  });

  public readonly announcement = computed(() => {
    const hint = this.hint();
    if (hint === null) return '';
    const keyName = SPOKEN_KEY_NAMES.get(this.symbol()) ?? this.symbol();
    const shiftNote = hint.shift === null ? '' : `, Shift with the ${FINGER_NAMES[hint.shift.finger]}`;
    return `Next: ${keyName}, ${FINGER_NAMES[hint.finger]}${shiftNote}`;
  });

  public isNextKey(cap: KeyCap): boolean {
    return cap.code === this.hint()?.keyCode;
  }

  public isHeldShift(cap: KeyCap): boolean {
    return cap.code === this.hint()?.shift?.keyCode;
  }

  public isHomeAnchor(cap: KeyCap): boolean {
    return HOME_ANCHOR_CODES.has(cap.code);
  }

  public isLit(finger: Finger): boolean {
    return this.litFingers().has(finger);
  }
}
