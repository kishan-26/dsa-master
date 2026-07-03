"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelectChips } from "@/components/ui/multi-select-chips";
import { MISTAKE_TAGS } from "@/lib/constants/question";
import { useLogAttempt } from "@/hooks/use-questions";
import { ApiError } from "@/lib/utils/api-fetch";

export function LogAttemptDialog({
  questionId,
  open,
  onClose,
}: {
  questionId: string;
  open: boolean;
  onClose: () => void;
}) {
  const logAttempt = useLogAttempt(questionId);
  const [status, setStatus] = useState<"Failed" | "Solved" | "Gave Up">("Solved");
  const [timeTaken, setTimeTaken] = useState("");
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  function reset() {
    setStatus("Solved");
    setTimeTaken("");
    setMistakes([]);
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await logAttempt.mutateAsync({
        status,
        timeTakenMinutes: timeTaken ? Number(timeTaken) : undefined,
        mistakes,
        notes: notes || undefined,
      });
      toast.success("Attempt logged");
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't log attempt");
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Log an attempt">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="attempt-status">Result</Label>
          <Select id="attempt-status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="Solved">Solved</option>
            <option value="Failed">Failed</option>
            <option value="Gave Up">Gave Up</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="attempt-time">Time taken (minutes)</Label>
          <Input
            id="attempt-time"
            type="number"
            min={0}
            value={timeTaken}
            onChange={(e) => setTimeTaken(e.target.value)}
          />
        </div>

        {status !== "Solved" && (
          <div>
            <Label>What went wrong?</Label>
            <MultiSelectChips options={[...MISTAKE_TAGS]} selected={mistakes} onChange={setMistakes} />
          </div>
        )}

        <div>
          <Label htmlFor="attempt-notes">Notes (optional)</Label>
          <Textarea id="attempt-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={logAttempt.isPending}>
            Save attempt
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
