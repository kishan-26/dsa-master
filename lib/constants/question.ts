export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const QUESTION_STATUSES = ["Not Started", "Attempted", "Solved", "Mastered"] as const;
export type QuestionStatus = (typeof QUESTION_STATUSES)[number];

export const PLATFORMS = ["LeetCode", "Codeforces", "GeeksforGeeks", "HackerRank", "Other"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const BIG_O_VALUES = [
  "O(1)",
  "O(log n)",
  "O(n)",
  "O(n log n)",
  "O(n^2)",
  "O(n^3)",
  "O(2^n)",
  "O(n!)",
  "O(sqrt n)",
  "O(n + m)",
  "O(m log n)",
] as const;

export const MISTAKE_TAGS = [
  "Off By One",
  "Wrong Binary Search",
  "Wrong Condition",
  "Overflow",
  "Edge Case",
  "Wrong STL",
  "Infinite Loop",
  "Time Complexity",
  "Logic Error",
  "Dry Run Mistake",
] as const;
export type MistakeTag = (typeof MISTAKE_TAGS)[number];

export const REVISION_OUTCOMES = ["failed", "struggled", "confident"] as const;
export type RevisionOutcome = (typeof REVISION_OUTCOMES)[number];
