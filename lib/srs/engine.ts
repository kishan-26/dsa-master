import { type RevisionOutcome } from "@/lib/constants/question";

export interface SrsState {
  easeFactor: number;
  intervalDays: number;
}

export interface SrsResult extends SrsState {
  nextRevisionDate: Date;
}

const MIN_EASE_FACTOR = 1.3;
const FIRST_INTERVAL_DAYS = 1;

/**
 * Adaptive spaced repetition (SM-2 inspired, not fixed Day 1/3/7/15/30/60):
 * - First solve: schedule Day 1.
 * - "confident": interval *= ~2.5 (ease factor also nudges up slightly,
 *   capped implicitly by how confidence compounds over reviews).
 * - "struggled": interval resets to a short 1-3 day window and ease factor
 *   drops, so a shaky question comes back around sooner.
 * - "failed": full reset to Day 1 and a bigger ease-factor penalty.
 */
export function computeNextRevision(
  current: SrsState,
  outcome: RevisionOutcome,
  { isFirstSolve = false }: { isFirstSolve?: boolean } = {}
): SrsResult {
  if (isFirstSolve) {
    return {
      easeFactor: current.easeFactor || 2.5,
      intervalDays: FIRST_INTERVAL_DAYS,
      nextRevisionDate: addDays(new Date(), FIRST_INTERVAL_DAYS),
    };
  }

  let { easeFactor } = current;
  let intervalDays: number;

  switch (outcome) {
    case "confident":
      easeFactor = Math.min(easeFactor + 0.15, 3.0);
      intervalDays = Math.max(1, Math.round((current.intervalDays || 1) * 2.5));
      break;
    case "struggled":
      easeFactor = Math.max(easeFactor - 0.2, MIN_EASE_FACTOR);
      // Short window: 1-3 days, nudged by remaining ease factor so a
      // question that's *almost* solid comes back a little later than one
      // that's shaky across the board.
      intervalDays = Math.round(1 + easeFactor - MIN_EASE_FACTOR);
      intervalDays = Math.min(Math.max(intervalDays, 1), 3);
      break;
    case "failed":
    default:
      easeFactor = Math.max(easeFactor - 0.3, MIN_EASE_FACTOR);
      intervalDays = FIRST_INTERVAL_DAYS;
      break;
  }

  return {
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    nextRevisionDate: addDays(new Date(), intervalDays),
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
