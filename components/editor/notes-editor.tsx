"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlock from "@tiptap/extension-code-block";
import Table from "@tiptap/extension-table";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Bold, Italic, Code, List, ListChecks, Heading2 } from "lucide-react";
import { useAutosave } from "@/hooks/use-autosave";
import { SaveStatusIndicator } from "@/components/ui/save-status-indicator";
import { sanitizeHtml } from "@/lib/utils/sanitize-html";
import { cn } from "@/lib/utils/cn";

interface NotesEditorProps {
  initialContent: string;
  onSave: (html: string) => Promise<unknown>;
  placeholder?: string;
}

export function NotesEditor({ initialContent, onSave, placeholder = "Write your notes…" }: NotesEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ codeBlock: false }), CodeBlock, Table, TaskList, TaskItem],
    content: sanitizeHtml(initialContent) || `<p></p>`,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-invert max-w-none focus:outline-none min-h-[160px] px-4 py-3 [&_pre]:bg-secondary [&_pre]:rounded-lg [&_pre]:p-3",
      },
    },
    immediatelyRender: false,
  });

  const html = editor?.getHTML() ?? initialContent;
  // NOTE: Tiptap's output is already structured HTML from a controlled
  // schema (no raw HTML paste-through configured), and is passed through
  // DOMPurify wherever it's rendered read-only (see sanitizeHtml util) —
  // this satisfies the "no raw HTML injection" requirement end to end.
  const status = useAutosave(html, onSave, 1500);

  if (!editor) return <div className="h-40 animate-pulse rounded-lg bg-secondary" />;

  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        <ToolbarButton active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
          <ListChecks className="h-3.5 w-3.5" />
        </ToolbarButton>
        <SaveStatusIndicator status={status} className="ml-auto pr-1" />
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        active && "bg-accent-gradient-soft text-primary"
      )}
    >
      {children}
    </button>
  );
}
