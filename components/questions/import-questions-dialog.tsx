"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Download, ClipboardPaste } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge, difficultyVariant } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils/cn";
import { CURATED_QUESTIONS, CURATED_TOPICS, type CuratedQuestion } from "@/lib/data/curated-questions";
import { useBulkImportQuestions } from "@/hooks/use-bulk-import";
import { ApiError } from "@/lib/utils/api-fetch";

type Tab = "curated" | "paste";
const DIFFICULTY_FILTERS = ["All", "Easy", "Medium", "Hard"] as const;

export function ImportQuestionsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("curated");
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<(typeof DIFFICULTY_FILTERS)[number]>("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pasteText, setPasteText] = useState("");
  const bulkImport = useBulkImportQuestions();

  const filtered = useMemo(() => {
    return CURATED_QUESTIONS.filter((q) => {
      if (difficultyFilter !== "All" && q.difficulty !== difficultyFilter) return false;
      if (search && !q.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, difficultyFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, CuratedQuestion[]>();
    for (const topic of CURATED_TOPICS) map.set(topic, []);
    for (const q of filtered) map.get(q.topic)?.push(q);
    return Array.from(map.entries()).filter(([, qs]) => qs.length > 0);
  }, [filtered]);

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  function toggleTopic(topic: string, questions: CuratedQuestion[]) {
    const allSelected = questions.every((q) => selected.has(q.leetcodeSlug));
    setSelected((prev) => {
      const next = new Set(prev);
      questions.forEach((q) => (allSelected ? next.delete(q.leetcodeSlug) : next.add(q.leetcodeSlug)));
      return next;
    });
  }

  function parsePastedList(): { items: CuratedQuestion[]; errors: string[] } {
    const items: CuratedQuestion[] = [];
    const errors: string[] = [];
    const lines = pasteText.split("\n").map((l) => l.trim()).filter(Boolean);

    lines.forEach((line, i) => {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length < 4) {
        errors.push(`Line ${i + 1}: expected 4 parts separated by "|", got ${parts.length}`);
        return;
      }
      const [title, slug, difficultyRaw, topic] = parts;
      const difficulty = ["Easy", "Medium", "Hard"].find(
        (d) => d.toLowerCase() === difficultyRaw!.toLowerCase()
      ) as "Easy" | "Medium" | "Hard" | undefined;
      if (!difficulty) {
        errors.push(`Line ${i + 1}: difficulty must be Easy, Medium, or Hard (got "${difficultyRaw}")`);
        return;
      }
      if (!title || !slug || !topic) {
        errors.push(`Line ${i + 1}: title, slug, and topic are all required`);
        return;
      }
      items.push({ title, leetcodeSlug: slug, difficulty, topic, patterns: [] });
    });

    return { items, errors };
  }

  async function handleImportCurated() {
    const items = CURATED_QUESTIONS.filter((q) => selected.has(q.leetcodeSlug));
    if (items.length === 0) {
      toast.error("Select at least one question first");
      return;
    }
    try {
      const result = await bulkImport.mutateAsync(items);
      toast.success(`Added ${result.created} question${result.created === 1 ? "" : "s"}${result.skipped ? ` (${result.skipped} already existed)` : ""}`);
      setSelected(new Set());
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Import failed");
    }
  }

  async function handleImportPasted() {
    const { items, errors } = parsePastedList();
    if (errors.length > 0) {
      toast.error(`${errors.length} line(s) couldn't be parsed — fix and try again`);
      return;
    }
    if (items.length === 0) {
      toast.error("Paste at least one question first");
      return;
    }
    try {
      const result = await bulkImport.mutateAsync(items);
      toast.success(`Added ${result.created} question${result.created === 1 ? "" : "s"}${result.skipped ? ` (${result.skipped} already existed)` : ""}`);
      setPasteText("");
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Import failed");
    }
  }

  const parsedPreview = tab === "paste" ? parsePastedList() : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Import questions"
      description="Bulk-add questions instead of typing each one — only titles/links are stored, never problem text."
      className="max-w-3xl"
    >
      <div className="mb-4 flex gap-1 rounded-lg border border-border p-1">
        <button
          onClick={() => setTab("curated")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
            tab === "curated" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Download className="h-3.5 w-3.5" />
          Curated list ({CURATED_QUESTIONS.length})
        </button>
        <button
          onClick={() => setTab("paste")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
            tab === "paste" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          Paste your own
        </button>
      </div>

      {tab === "curated" ? (
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="focus-ring h-9 w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-3 text-sm"
              />
            </div>
            {DIFFICULTY_FILTERS.map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={cn(
                  "rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors",
                  difficultyFilter === d ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
            {grouped.map(([topic, questions]) => {
              const allSelected = questions.every((q) => selected.has(q.leetcodeSlug));
              return (
                <div key={topic}>
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => toggleTopic(topic, questions)}
                      className="h-3.5 w-3.5 rounded accent-primary"
                    />
                    {topic} ({questions.length})
                  </label>
                  <div className="space-y-0.5">
                    {questions.map((q) => (
                      <label
                        key={q.leetcodeSlug}
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-secondary/60"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(q.leetcodeSlug)}
                          onChange={() => toggle(q.leetcodeSlug)}
                          className="h-3.5 w-3.5 rounded accent-primary"
                        />
                        <span className="flex-1 truncate">{q.title}</span>
                        <Badge variant={difficultyVariant(q.difficulty)}>{q.difficulty}</Badge>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
            {grouped.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No matches.</p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={handleImportCurated} loading={bulkImport.isPending}>
                Import selected
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            One question per line, format: <code className="rounded bg-secondary px-1 py-0.5">Title | leetcode-slug | Difficulty | Topic</code>
            <br />
            Example: <code className="rounded bg-secondary px-1 py-0.5">Two Sum | two-sum | Easy | Arrays</code>
          </p>
          <Textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={10}
            placeholder={"Two Sum | two-sum | Easy | Arrays\nValid Anagram | valid-anagram | Easy | Arrays"}
            className="font-mono text-xs"
          />
          {parsedPreview && pasteText.trim() && (
            <p className="mt-2 text-xs text-muted-foreground">
              {parsedPreview.items.length} valid line(s)
              {parsedPreview.errors.length > 0 && `, ${parsedPreview.errors.length} with errors`}
            </p>
          )}
          {parsedPreview && parsedPreview.errors.length > 0 && (
            <ul className="mt-1 max-h-24 space-y-0.5 overflow-y-auto text-xs text-destructive">
              {parsedPreview.errors.slice(0, 10).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleImportPasted} loading={bulkImport.isPending}>
              Import pasted list
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
