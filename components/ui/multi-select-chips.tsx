"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface MultiSelectChipsProps {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
}

export function MultiSelectChips({
  options,
  selected,
  onChange,
  placeholder = "Add…",
  allowCustom = false,
}: MultiSelectChipsProps) {
  const [input, setInput] = useState("");
  const available = options.filter((o) => !selected.includes(o));

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && allowCustom && input.trim()) {
      e.preventDefault();
      if (!selected.includes(input.trim())) onChange([...selected, input.trim()]);
      setInput("");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selected.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className="focus-ring inline-flex items-center gap-1 rounded-full bg-accent-gradient-soft px-3 py-1 text-xs font-medium text-primary"
          >
            {value}
            <X className="h-3 w-3" />
          </button>
        ))}
        {allowCustom && (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="focus-ring h-7 min-w-[90px] flex-1 rounded-full border border-dashed border-border bg-transparent px-3 text-xs placeholder:text-muted-foreground"
          />
        )}
      </div>
      {available.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-border pt-2">
          {available.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={cn(
                "focus-ring rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              )}
            >
              + {value}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
