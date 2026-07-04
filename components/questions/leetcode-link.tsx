import { ExternalLink } from "lucide-react";

export function LeetCodeLink({ slug }: { slug?: string }) {
  if (!slug) return null;

  // Support both slug and full URL
  const href = slug.startsWith("http")
    ? slug
    : `https://leetcode.com/problems/${slug}/`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label="Open on LeetCode"
      className="focus-ring inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      title="Open on LeetCode"
    >
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}