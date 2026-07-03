"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { usePlanner, useUpdatePlannerGoal } from "@/hooks/use-planner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlannerProgressBar } from "@/components/planner/planner-progress-bar";
import { ApiError } from "@/lib/utils/api-fetch";

export default function PlannerPage() {
  const { data, isLoading } = usePlanner();
  const updateGoal = useUpdatePlannerGoal();

  const [form, setForm] = useState({ questions: 3, revisions: 5, studyMinutes: 60 });

  useEffect(() => {
    if (data) setForm(data.goal);
  }, [data]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateGoal.mutateAsync(form);
      toast.success("Daily goals updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't update goals");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl"
    >
      <h1 className="text-2xl font-bold">Daily planner</h1>
      <p className="mt-1 text-muted-foreground">Set your goals, track today&apos;s progress against them.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Today&apos;s progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading || !data ? (
            <>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
            </>
          ) : (
            <>
              <PlannerProgressBar label="Questions solved" current={data.progress.questions} goal={data.goal.questions} />
              <PlannerProgressBar label="Revisions completed" current={data.progress.revisions} goal={data.goal.revisions} />
              <PlannerProgressBar label="Study time" current={data.progress.studyMinutes} goal={data.goal.studyMinutes} unit="min" />
              {data.progress.questions >= data.goal.questions &&
                data.progress.revisions >= data.goal.revisions && (
                  <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    All goals met for today — nice work.
                  </div>
                )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Set your goals</CardTitle>
          <CardDescription>Applies from tomorrow&apos;s tracking onward.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="goal-questions">Questions per day</Label>
              <Input
                id="goal-questions"
                type="number"
                min={0}
                value={form.questions}
                onChange={(e) => setForm({ ...form, questions: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="goal-revisions">Revisions per day</Label>
              <Input
                id="goal-revisions"
                type="number"
                min={0}
                value={form.revisions}
                onChange={(e) => setForm({ ...form, revisions: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="goal-study">Study time (minutes)</Label>
              <Input
                id="goal-study"
                type="number"
                min={0}
                value={form.studyMinutes}
                onChange={(e) => setForm({ ...form, studyMinutes: Number(e.target.value) })}
              />
            </div>
            <Button type="submit" loading={updateGoal.isPending}>
              Save goals
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
