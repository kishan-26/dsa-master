import type {
  Difficulty,
  QuestionStatus,
  Platform,
  MistakeTag,
  RevisionOutcome,
} from "@/lib/constants/question";

export type { Difficulty, QuestionStatus, Platform, MistakeTag, RevisionOutcome };

export interface CodeApproach {
  code: string;
  language: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface AttemptEntry {
  _id: string;
  attemptedAt: string;
  status: "Failed" | "Solved" | "Gave Up";
  timeTakenMinutes?: number;
  mistakes: MistakeTag[];
  notes?: string;
}

export interface RevisionEntry {
  _id: string;
  revisedAt: string;
  outcome: RevisionOutcome;
  intervalDaysBefore: number;
  intervalDaysAfter: number;
  easeFactorBefore: number;
  easeFactorAfter: number;
}

export interface PopulatedTopic {
  _id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface PopulatedPattern {
  _id: string;
  name: string;
  slug: string;
}

export interface QuestionListItem {
  _id: string;
  title: string;
  difficulty: Difficulty;
  status: QuestionStatus;
  topic: PopulatedTopic;
  patterns: PopulatedPattern[];
  platform: Platform;
  leetcodeSlug?: string;
  confidence: number;
  isFavorite: boolean;
  nextRevisionDate: string | null;
  tags: string[];
  createdAt: string;
}

export interface QuestionDetail extends QuestionListItem {
  leetcodeId?: string;
  attempts: AttemptEntry[];
  revisionHistory: RevisionEntry[];
  notes: string;
  mistakes: MistakeTag[];
  editorialNotes?: string;
  easeFactor: number;
  intervalDays: number;
  code: {
    brute?: CodeApproach;
    better?: CodeApproach;
    optimal?: CodeApproach;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
