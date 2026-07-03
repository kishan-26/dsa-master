import {
  LayoutDashboard,
  ListChecks,
  Layers,
  GitBranch,
  BarChart3,
  CalendarClock,
  Settings,
  Clock,
  AlertTriangle,
  Layers3,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Due Today", href: "/revisions", icon: Clock },
  { label: "Questions", href: "/questions", icon: ListChecks },
  { label: "Flashcards", href: "/flashcards", icon: Layers3 },
  { label: "Topics", href: "/topics", icon: Layers },
  { label: "Patterns", href: "/patterns", icon: GitBranch },
  { label: "Mistakes", href: "/mistakes", icon: AlertTriangle },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Planner", href: "/planner", icon: CalendarClock },
  { label: "Achievements", href: "/achievements", icon: Trophy },
  { label: "Settings", href: "/settings", icon: Settings },
];
