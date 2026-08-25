import { FakeClock } from '../../../testing';
import { ScoreTracker } from './score-tracker';

describe('ScoreTracker', () => {
  let clock: FakeClock;
  let tracker: ScoreTracker;

  beforeEach(() => {
    clock = new FakeClock();
    tracker = new ScoreTracker(clock);
  });

  it('counts nothing before the first keystroke, however long the user stares at the screen', () => {
    clock.advance(10_000);
    expect(tracker.counters()).toEqual({ activeMilliseconds: 0, acceptedKeystrokes: 0, rejectedKeystrokes: 0 });
  });

  it('starts timing on the first keystroke, not before it', () => {
    clock.advance(10_000);
    tracker.recordAccepted();
    clock.advance(2_000);
    expect(tracker.counters().activeMilliseconds).toBe(2_000);
  });

  it('counts both accepted and rejected keystrokes', () => {
    tracker.recordAccepted();
    tracker.recordRejected();
    tracker.recordAccepted();
    expect(tracker.counters()).toMatchObject({ acceptedKeystrokes: 2, rejectedKeystrokes: 1 });
  });

  it('excludes paused time from the active total', () => {
    tracker.recordAccepted();
    clock.advance(3_000);
    tracker.stopTiming();
    clock.advance(600_000);
    expect(tracker.counters().activeMilliseconds).toBe(3_000);
  });

  it('resumes timing on the keystroke after a pause and adds the intervals', () => {
    tracker.recordAccepted();
    clock.advance(3_000);
    tracker.stopTiming();
    clock.advance(600_000);
    tracker.recordAccepted();
    clock.advance(1_000);
    expect(tracker.counters().activeMilliseconds).toBe(4_000);
  });

  it('counts a long think between keystrokes only up to the idle limit', () => {
    tracker.recordAccepted();
    clock.advance(300_000);
    tracker.recordAccepted();
    expect(tracker.counters().activeMilliseconds).toBe(5_000);
  });

  it('freezes the live total once the reader has gone idle, without waiting for a keypress', () => {
    tracker.recordAccepted();
    clock.advance(2_000);
    expect(tracker.counters().activeMilliseconds).toBe(2_000);
    clock.advance(300_000);
    expect(tracker.counters().activeMilliseconds).toBe(5_000);
  });

  it('counts a normal typing rhythm in full', () => {
    tracker.recordAccepted();
    for (let keystroke = 0; keystroke < 9; keystroke += 1) {
      clock.advance(200);
      tracker.recordAccepted();
    }
    expect(tracker.counters().activeMilliseconds).toBe(1_800);
  });

  it('resumes counting in full after an idle stretch', () => {
    tracker.recordAccepted();
    clock.advance(300_000);
    tracker.recordAccepted();
    clock.advance(200);
    tracker.recordAccepted();
    expect(tracker.counters().activeMilliseconds).toBe(5_200);
  });

  it('is idempotent when timing is stopped twice', () => {
    tracker.recordAccepted();
    clock.advance(3_000);
    tracker.stopTiming();
    tracker.stopTiming();
    expect(tracker.counters().activeMilliseconds).toBe(3_000);
  });

  it('reports the in-flight interval so the display can update while typing', () => {
    tracker.recordAccepted();
    clock.advance(1_500);
    expect(tracker.counters().activeMilliseconds).toBe(1_500);
    clock.advance(1_500);
    expect(tracker.counters().activeMilliseconds).toBe(3_000);
  });
});
