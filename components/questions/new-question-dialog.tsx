"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MultiSelectChips } from "@/components/ui/multi-select-chips";
import { DIFFICULTIES, PLATFORMS } from "@/lib/constants/question";
import { useTopics, usePatterns, useCreateTopic, useCreatePattern } from "@/hooks/use-taxonomy";
import { useCreateQuestion } from "@/hooks/use-questions";
import { ApiError } from "@/lib/utils/api-fetch";

export function NewQuestionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { data: topics } = useTopics();
  const { data: patterns } = usePatterns();
  const createTopic = useCreateTopic();
  const createPattern = useCreatePattern();
  const createQuestion = useCreateQuestion();

  const [form, setForm] = useState({
    title: "",
    difficulty: "Medium" as (typeof DIFFICULTIES)[number],
    topic: "",
    platform: "LeetCode" as (typeof PLATFORMS)[number],
    leetcodeSlug: "",
    newTopicName: "",
  });
  const [selectedPatternIds, setSelectedPatternIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [creatingTopic, setCreatingTopic] = useState(false);

  function reset() {
    setForm({ title: "", difficulty: "Medium", topic: "", platform: "LeetCode", leetcodeSlug: "", newTopicName: "" });
    setSelectedPatternIds([]);
    setTags([]);
    setCreatingTopic(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let topicId = form.topic;
    if (creatingTopic && form.newTopicName.trim()) {
      try {
        const result = await createTopic.mutateAsync(form.newTopicName.trim());
        topicId = result.topic._id;
      } catch {
        toast.error("Couldn't create that topic");
        return;
      }
    }

    if (!form.title.trim() || !topicId) {
      toast.error("Title and topic are required");
      return;
    }

    try {
      const { question } = await createQuestion.mutateAsync({
        title: form.title.trim(),
        difficulty: form.difficulty,
        topic: topicId,
        patterns: selectedPatternIds,
        platform: form.platform,
        leetcodeSlug: form.leetcodeSlug || undefined,
        tags,
      });
      toast.success("Question added");
      reset();
      onClose();
      router.push(`/questions/${question._id}` as any);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create question");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title="Add a question"
      description="Only the id/slug is stored — the problem statement never is."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="q-title">Title</Label>
          <Input
            id="q-title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Two Sum"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="q-difficulty">Difficulty</Label>
            <Select
              id="q-difficulty"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="q-platform">Platform</Label>
            <Select
              id="q-platform"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value as any })}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="q-topic">Topic</Label>
          {!creatingTopic ? (
            <div className="flex gap-2">
              <Select
                id="q-topic"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
              >
                <option value="">Select a topic…</option>
                {topics?.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </Select>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreatingTopic(true)}>
                New
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={form.newTopicName}
                onChange={(e) => setForm({ ...form, newTopicName: e.target.value })}
                placeholder="e.g. Dynamic Programming"
                autoFocus
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => setCreatingTopic(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>

        {form.platform === "LeetCode" && (
          <div>
            <Label htmlFor="q-slug">LeetCode slug</Label>
            <Input
              id="q-slug"
              value={form.leetcodeSlug}
              onChange={(e) => setForm({ ...form, leetcodeSlug: e.target.value })}
              placeholder="two-sum"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              From the URL: leetcode.com/problems/<strong>two-sum</strong>/
            </p>
          </div>
        )}

        <div>
          <Label>Patterns</Label>
          <MultiSelectChips
            options={patterns?.map((p) => p.name) ?? []}
            selected={selectedPatternIds
              .map((id) => patterns?.find((p) => p._id === id)?.name)
              .filter((n): n is string => !!n)}
            onChange={(names) => {
              const ids = names
                .map((name) => patterns?.find((p) => p.name === name)?._id)
                .filter((id): id is string => !!id);
              setSelectedPatternIds(ids);
            }}
          />
        </div>

        <div>
          <Label>Tags</Label>
          <MultiSelectChips options={[]} selected={tags} onChange={setTags} allowCustom placeholder="Add a tag and press Enter" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createQuestion.isPending}>
            Add question
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
