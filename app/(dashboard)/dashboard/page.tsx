"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Flame, Clock, Trophy } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useDashboardAnalytics } from "@/hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger-list";
import { GoalRing } from "@/components/dashboard/goal-ring";
import { StrongWeakTopics } from "@/components/dashboard/strong-weak-topics";
import { LearningCalendar } from "@/components/dashboard/learning-calendar";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

// Recharts + the SVG heatmap only matter once real data exists — split them
// out of the main dashboard chunk.
const WeeklyTrendChart = dynamic(
  () => import("@/components/dashboard/weekly-trend-chart").then((m) => m.WeeklyTrendChart),
  { ssr: false, loading: () => <Skeleton className="h-[200px] w-full" /> }
);
const Heatmap = dynamic(() => import("@/components/dashboard/heatmap").then((m) => m.Heatmap), {
  ssr: false,
  loading: () => <Skeleton className="h-24 w-full" />,
});

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useDashboardAnalytics();

  if (isLoading || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
        </h1>
        <div className="mt-6">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-2xl font-bold">
        Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
      </h1>
      <p className="mt-1 text-muted-foreground">Here&apos;s where your prep stands today.</p>

      <StaggerContainer className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <Card glow className="flex h-full items-center justify-center p-4">
            <GoalRing value={data.solvedToday} goal={data.dailyGoal.questions} label="Today's goal" />
          </Card>
        </StaggerItem>

        <StaggerItem>
          <StatCard
            icon={<Flame className="h-5 w-5 text-warning" />}
            label="Current streak"
            value={data.currentStreak}
            suffix={data.currentStreak === 1 ? " day" : " days"}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Clock className="h-5 w-5 text-primary" />}
            label="Revision due"
            value={data.revisionDueCount}
            href="/revisions"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<Trophy className="h-5 w-5 text-success" />}
            label="Total solved"
            value={data.totalSolved}
          />
        </StaggerItem>
      </StaggerContainer>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card interactive={false} className="lg:col-span-2">
          <CardHeader>
            <CardTitle>This week</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyTrendChart data={data.weeklyTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Strong &amp; weak topics</CardTitle>
          </CardHeader>
          <CardContent>
            <StrongWeakTopics strong={data.strongTopics} weak={data.weakTopics} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>365-day activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Heatmap days={data.heatmap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <LearningCalendar />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix = "",
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  href?: string;
}) {
  const content = (
    <Card interactive={!!href} className="h-full">
      <CardContent className="flex h-full flex-col justify-center gap-2 p-6">
        {icon}
        <div>
          <p className="text-2xl font-bold">
            <AnimatedCounter value={value} />
            {suffix}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="focus-ring block h-full rounded-2xl">
        {content}
      </a>
    );
  }
  return content;
}
