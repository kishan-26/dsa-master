"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView } from "@codemirror/view";
import { Select } from "@/components/ui/select";
import { SaveStatusIndicator } from "@/components/ui/save-status-indicator";
import { useAutosave } from "@/hooks/use-autosave";
import { BIG_O_VALUES } from "@/lib/constants/question";
import { cn } from "@/lib/utils/cn";
import type { CodeApproach } from "@/types/question";

const LANGUAGES = [
  { value: "cpp", label: "C++", extension: cpp() },
  { value: "python", label: "Python", extension: python() },
  { value: "javascript", label: "JavaScript", extension: javascript() },
  { value: "java", label: "Java", extension: cpp() }, // close-enough highlighting
];

const APPROACHES: { key: "brute" | "better" | "optimal"; label: string }[] = [
  { key: "brute", label: "Brute Force" },
  { key: "better", label: "Better" },
  { key: "optimal", label: "Optimal" },
];

interface CodeApproachEditorProps {
  code: { brute?: CodeApproach; better?: CodeApproach; optimal?: CodeApproach };
  onSave: (approach: "brute" | "better" | "optimal", value: CodeApproach) => Promise<unknown>;
}

export function CodeApproachEditor({ code, onSave }: CodeApproachEditorProps) {
  const [activeTab, setActiveTab] = useState<"brute" | "better" | "optimal">("optimal");

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-border">
        {APPROACHES.map((a) => (
          <button
            key={a.key}
            onClick={() => setActiveTab(a.key)}
            className={cn(
              "focus-ring relative px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              activeTab === a.key && "text-foreground"
            )}
          >
            {a.label}
            {activeTab === a.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent-gradient" />
            )}
          </button>
        ))}
      </div>

      {APPROACHES.map(
        (a) =>
          activeTab === a.key && (
            <SingleApproachEditor
              key={a.key}
              approach={code[a.key] ?? { code: "", language: "cpp" }}
              onSave={(value) => onSave(a.key, value)}
            />
          )
      )}
    </div>
  );
}

function SingleApproachEditor({
  approach,
  onSave,
}: {
  approach: CodeApproach;
  onSave: (value: CodeApproach) => Promise<unknown>;
}) {
  const [local, setLocal] = useState(approach);
  const status = useAutosave(local, onSave, 1200);
  const lang = LANGUAGES.find((l) => l.value === local.language) ?? LANGUAGES[0]!;

  return (
    <div className="pt-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Select
          className="w-auto min-w-[110px]"
          value={local.language}
          onChange={(e) => setLocal({ ...local, language: e.target.value })}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </Select>
        <Select
          className="w-auto min-w-[110px]"
          value={local.timeComplexity ?? ""}
          onChange={(e) => setLocal({ ...local, timeComplexity: e.target.value || undefined })}
        >
          <option value="">Time complexity</option>
          {BIG_O_VALUES.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </Select>
        <Select
          className="w-auto min-w-[110px]"
          value={local.spaceComplexity ?? ""}
          onChange={(e) => setLocal({ ...local, spaceComplexity: e.target.value || undefined })}
        >
          <option value="">Space complexity</option>
          {BIG_O_VALUES.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </Select>
        <SaveStatusIndicator status={status} className="ml-auto" />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <CodeMirror
          value={local.code}
          height="320px"
          theme="dark"
          extensions={[lang.extension, EditorView.lineWrapping]}
          onChange={(value) => setLocal((prev) => ({ ...prev, code: value }))}
          basicSetup={{ foldGutter: true, dropCursor: true, allowMultipleSelections: true }}
        />
      </div>
    </div>
  );
}
