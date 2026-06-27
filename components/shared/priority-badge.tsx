import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/agent";
import { ShieldAlert, Flame, AlertTriangle, Info } from "lucide-react";

const priorityConfig: Record<
  string,
  { label: string; variant: "default" | "destructive" | "outline"; icon: React.ReactNode; className: string }
> = {
  urgent: {
    label: "Urgent",
    variant: "destructive" as const,
    icon: <ShieldAlert className="h-3 w-3" />,
    className: "bg-urgent-soft text-urgent border-urgent/25 font-semibold",
  },
  high: {
    label: "High",
    variant: "default" as const,
    icon: <Flame className="h-3 w-3" />,
    className: "bg-accent-soft text-high border-high/25 font-semibold",
  },
  medium: {
    label: "Medium",
    variant: "outline" as const,
    icon: <AlertTriangle className="h-3 w-3" />,
    className: "bg-warning-soft text-warning border-warning/25 font-semibold",
  },
  low: {
    label: "Low",
    variant: "outline" as const,
    icon: <Info className="h-3 w-3" />,
    className: "bg-info-soft text-info border-info/25 font-semibold",
  },
};

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <Badge variant="outline" className={cn("gap-1 px-2 py-0.5 text-[11px] h-auto rounded-full border-0", config.className, className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

export function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, string> = {
    Work: "💼",
    Study: "📚",
    Personal: "👤",
    Health: "❤️",
    Finance: "💰",
    General: "📋",
  };
  return <span className="truncate">{icons[category] || "📋"}</span>;
}
