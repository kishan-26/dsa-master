"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Star, Trash2, Plus, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, difficultyVariant } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LeetCodeLink } from "@/components/questions/leetcode-link";
import { ConfidenceMeter } from "@/components/questions/confidence-meter";
import { AttemptTimeline } from "@/components/questions/attempt-timeline";
import { RevisionTimeline } from "@/components/questions/revision-timeline";
import { LogAttemptDialog } from "@/components/questions/log-attempt-dialog";
import { CreateFlashcardDialog } from "@/components/flashcards/create-flashcard-dialog";
import { QuestionDetailSkeleton } from "@/components/questions/question-detail-skeleton";
import { useQuestion, useUpdateQuestion, useDeleteQuestion, useLogRevision } from "@/hooks/use-questions";
import { ApiError } from "@/lib/utils/api-fetch";

// CodeMirror + Tiptap pull in ~300KB combined — split them out of the main
// route chunk and load only when the question detail page actually mounts.
const CodeApproachEditor = dynamic(
  () => import("@/components/editor/code-approach-editor").then((m) => m.CodeApproachEditor),
  { ssr: false, loading: () => <Skeleton className="h-80 w-full rounded-lg" /> }
);
const NotesEditor = dynamic(
  () => import("@/components/editor/notes-editor").then((m) => m.NotesEditor),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full rounded-lg" /> }
);

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: question, isLoading } = useQuestion(params.id);
  const updateQuestion = useUpdateQuestion(params.id);
  const deleteQuestion = useDeleteQuestion();
  const logRevision = useLogRevision(params.id);
  const [attemptDialogOpen, setAttemptDialogOpen] = useState(false);
  const [flashcardDialogOpen, setFlashcardDialogOpen] = useState(false);

  if (isLoading || !question) {
    return <QuestionDetailSkeleton />;
  }

  async function handleDelete() {
    if (!confirm(`Delete "${question!.title}"? This can't be undone.`)) return;
    try {
      await deleteQuestion.mutateAsync(params.id);
      toast.success("Question deleted");
      router.push("/questions");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete");
    }
  }

  const isDue = question.nextRevisionDate && new Date(question.nextRevisionDate).getTime() <= Date.now();

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Button variant="ghost" size="sm" onClick={() => router.push("/questions")} className="mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to questions
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{question.title}</h1>
            <LeetCodeLink slug={question.leetcodeSlug} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={difficultyVariant(question.difficulty)}>{question.difficulty}</Badge>
            <Badge>{question.status}</Badge>
            <Badge variant="outline">{question.topic?.name}</Badge>
            {question.patterns.map((p) => (
              <Badge key={p._id} variant="outline">{p.name}</Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateQuestion.mutate({ isFavorite: !question.isFavorite })}
            aria-label="Toggle favorite"
          >
            <Star className={question.isFavorite ? "h-4 w-4 fill-medium text-medium" : "h-4 w-4"} />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDelete} aria-label="Delete question">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button variant="outline" onClick={() => setFlashcardDialogOpen(true)}>
            <Layers3 className="h-4 w-4" />
            Make flashcard
          </Button>
          <Button onClick={() => setAttemptDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Log attempt
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Solution</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeApproachEditor
                code={question.code}
                onSave={(approach, value) =>
                  updateQuestion.mutateAsync({ code: { ...question.code, [approach]: value } })
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <NotesEditor
                initialContent={question.notes}
                onSave={(html) => updateQuestion.mutateAsync({ notes: html })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attempt history</CardTitle>
            </CardHeader>
            <CardContent>
              <AttemptTimeline attempts={question.attempts} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <ConfidenceMeter
                value={question.confidence}
                onChange={(v) => updateQuestion.mutate({ confidence: v })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spaced repetition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="text-muted-foreground">Next revision</p>
                <p className={isDue ? "font-medium text-warning" : "font-medium"}>
                  {question.nextRevisionDate
                    ? new Date(question.nextRevisionDate).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not scheduled — log a solved attempt first"}
                </p>
              </div>
              {question.nextRevisionDate && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => logRevision.mutate("failed")} loading={logRevision.isPending}>
                    Failed
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => logRevision.mutate("struggled")} loading={logRevision.isPending}>
                    Struggled
                  </Button>
                  <Button size="sm" onClick={() => logRevision.mutate("confident")} loading={logRevision.isPending}>
                    Confident
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revision history</CardTitle>
            </CardHeader>
            <CardContent>
              <RevisionTimeline revisions={question.revisionHistory} />
            </CardContent>
          </Card>
        </div>
      </div>

      <LogAttemptDialog
        questionId={params.id}
        open={attemptDialogOpen}
        onClose={() => setAttemptDialogOpen(false)}
      />
      <CreateFlashcardDialog
        open={flashcardDialogOpen}
        onClose={() => setFlashcardDialogOpen(false)}
        defaultQuestionId={params.id}
        defaultQuestionTitle={question.title}
      />
    </motion.div>
  );
}
