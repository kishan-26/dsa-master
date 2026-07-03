"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useMistakeAnalytics } from "@/hooks/use-mistake-analytics";
import { useTopics, usePatterns } from "@/hooks/use-taxonomy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const chartLoading = <Skeleton className="h-[200px] w-full" />;
const MistakeFrequencyChart = dynamic(
  () => import("@/components/mistakes/mistake-frequency-chart").then((m) => m.MistakeFrequencyChart),
  { ssr: false, loading: () => chartLoading }
);
const MistakeTrendChart = dynamic(
  () => import("@/components/mistakes/mistake-trend-chart").then((m) => m.MistakeTrendChart),
  { ssr: false, loading: () => chartLoading }
);

export default function MistakesPage() {
  const [topic, setTopic] = useState("");
  const [pattern, setPattern] = useState("");
  const { data: topics } = useTopics();
  const { data: patterns } = usePatterns();
  const { data, isLoading } = useMistakeAnalytics({ topic: topic || undefined, pattern: pattern || undefined });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mistake tracker</h1>
          <p className="mt-1 text-muted-foreground">
            {isLoading ? "Loading…" : `${data?.total ?? 0} mistake${data?.total === 1 ? "" : "s"} logged`}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-auto min-w-[140px]">
            <option value="">All topics</option>
            {topics?.map((t) => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </Select>
          <Select value={pattern} onChange={(e) => setPattern(e.target.value)} className="w-auto min-w-[140px]">
            <option value="">All patterns</option>
            {patterns?.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most common mistakes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[220px] w-full" /> : <MistakeFrequencyChart data={data?.mostCommon ?? []} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Trend (90 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[200px] w-full" /> : <MistakeTrendChart data={data?.trend ?? []} />}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
