import { cn } from "@/lib/utils"

interface SkeletonProps extends React.ComponentProps<"div"> {
  shimmer?: boolean
}

function Skeleton({ className, shimmer, ...props }: SkeletonProps) {
  const base = "rounded-md";
  const mode = shimmer
    ? cn(base, "skeleton-shimmer", "bg-border")
    : cn(base, "animate-pulse", "bg-muted");

  return (
    <div
      data-slot="skeleton"
      className={cn(mode, className)}
      {...props}
    />
  );
}

export { Skeleton };
