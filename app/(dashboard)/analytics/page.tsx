"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useOverviewAnalytics } from "@/hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const chartLoading = <Skeleton className="h-[220px] w-full" />;

const DifficultyDonut = dynamic(
  () => import("@/components/analytics/difficulty-donut").then((m) => m.DifficultyDonut),
  { ssr: false, loading: () => chartLoading }
);
const TopicBarChart = dynamic(
  () => import("@/components/analytics/topic-bar-chart").then((m) => m.TopicBarChart),
  { ssr: false, loading: () => chartLoading }
);
const DailyTrendChart = dynamic(
  () => import("@/components/analytics/daily-trend-chart").then((m) => m.DailyTrendChart),
  { ssr: false, loading: () => chartLoading }
);
const ConfidenceChart = dynamic(
  () => import("@/components/analytics/confidence-chart").then((m) => m.ConfidenceChart),
  { ssr: false, loading: () => chartLoading }
);
const TopicMasteryList = dynamic(
  () => import("@/components/analytics/topic-mastery-list").then((m) => m.TopicMasteryList),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full" /> }
);

export default function AnalyticsPage() {
  const { data, isLoading } = useOverviewAnalytics();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="mt-1 text-muted-foreground">A closer look at how your prep is actually going.</p>

      {isLoading || !data ? (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryStat label="Avg. solve time" value={data.avgSolveTimeMinutes != null ? `${data.avgSolveTimeMinutes} min` : "—"} />
            <SummaryStat label="Revision completion" value={data.revisionCompletionRate != null ? `${data.revisionCompletionRate}%` : "—"} />
            <SummaryStat label="Consistency (90d)" value={`${data.consistencyPct}%`} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Solved trend (90 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <DailyTrendChart data={data.dailySolvedTrend} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Difficulty distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <DifficultyDonut data={data.difficultyDistribution} />
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Questions per topic</CardTitle>
              </CardHeader>
              <CardContent>
                <TopicBarChart data={data.questionsPerTopic} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Confidence over time</CardTitle>
              </CardHeader>
              <CardContent>
                <ConfidenceChart data={data.confidenceOverTime} />
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Topic mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <TopicMasteryList data={data.topicMastery} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
