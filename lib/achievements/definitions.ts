export interface AchievementStats {
  totalSolved: number;
  longestStreak: number;
  onTimeRevisions: number;
  topicSolvedByName: Map<string, number>; // lowercased topic name -> solved count
}

export interface AchievementResult {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "flame" | "brain" | "git-branch" | "network" | "layers";
  unlocked: boolean;
  current: number;
  target: number;
}

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: AchievementResult["icon"];
  target: (stats: AchievementStats) => number;
  current: (stats: AchievementStats) => number;
}

function topicSolved(stats: AchievementStats, needle: string): number {
  let total = 0;
  for (const [name, count] of stats.topicSolvedByName) {
    if (name.includes(needle)) total += count;
  }
  return total;
}

// Thresholds for the topic-specific "Master" achievements are an
// ASSUMPTION (not specified in the brief) — 10 solved questions in a
// matching topic. Easy to tune per-definition below.
const TOPIC_MASTER_THRESHOLD = 10;
const REVISION_MASTER_THRESHOLD = 50;

const DEFINITIONS: AchievementDef[] = [
  {
    id: "solved_100",
    title: "Century Club",
    description: "Solve 100 questions",
    icon: "trophy",
    target: () => 100,
    current: (s) => s.totalSolved,
  },
  {
    id: "solved_500",
    title: "Half-K Grinder",
    description: "Solve 500 questions",
    icon: "trophy",
    target: () => 500,
    current: (s) => s.totalSolved,
  },
  {
    id: "solved_1000",
    title: "Thousand Club",
    description: "Solve 1000 questions",
    icon: "trophy",
    target: () => 1000,
    current: (s) => s.totalSolved,
  },
  {
    id: "streak_30",
    title: "30-Day Streak",
    description: "Solve at least one question every day for 30 days straight",
    icon: "flame",
    target: () => 30,
    current: (s) => s.longestStreak,
  },
  {
    id: "revision_master",
    title: "Revision Master",
    description: `Complete ${REVISION_MASTER_THRESHOLD} on-time revisions`,
    icon: "brain",
    target: () => REVISION_MASTER_THRESHOLD,
    current: (s) => s.onTimeRevisions,
  },
  {
    id: "binary_search_master",
    title: "Binary Search Master",
    description: `Solve ${TOPIC_MASTER_THRESHOLD} Binary Search questions`,
    icon: "layers",
    target: () => TOPIC_MASTER_THRESHOLD,
    current: (s) => topicSolved(s, "binary search"),
  },
  {
    id: "graph_master",
    title: "Graph Master",
    description: `Solve ${TOPIC_MASTER_THRESHOLD} Graph questions`,
    icon: "network",
    target: () => TOPIC_MASTER_THRESHOLD,
    current: (s) => topicSolved(s, "graph"),
  },
  {
    id: "dp_master",
    title: "DP Master",
    description: `Solve ${TOPIC_MASTER_THRESHOLD} Dynamic Programming questions`,
    icon: "git-branch",
    target: () => TOPIC_MASTER_THRESHOLD,
    current: (s) => topicSolved(s, "dynamic programming") + topicSolved(s, " dp"),
  },
];

export function computeAchievements(stats: AchievementStats): AchievementResult[] {
  return DEFINITIONS.map((def) => {
    const current = def.current(stats);
    const target = def.target(stats);
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      unlocked: current >= target,
      current: Math.min(current, target),
      target,
    };
  });
}
