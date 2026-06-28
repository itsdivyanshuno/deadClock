import { Skeleton } from "@/components/ui/skeleton";

/* Staggered shimmer wrapper — wraps a skeleton card so it animates
   with a slight delay for a polished wave-loading effect */
function ShimmerBlock({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      className="rounded-xl skeleton-shimmer"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full anim-fade-up">
      <ShimmerBlock delay={0}>
        <Skeleton className="h-16 w-16 rounded-2xl mb-5" />
      </ShimmerBlock>
      <Skeleton className="h-6 w-48 mb-2.5 skeleton-shimmer" />
      <Skeleton className="h-4 w-72 max-w-[280px] mb-8 skeleton-shimmer" />
      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerBlock key={i} delay={i * 100}>
            <Skeleton className="h-16 rounded-xl" />
          </ShimmerBlock>
        ))}
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <ShimmerBlock key={i} delay={i * 80}>
          <div className="p-4 rounded-xl border border-border bg-surface">
            <div className="flex items-start gap-3">
              <Skeleton className="h-5 w-5 rounded-md mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-3 w-4" />
            </div>
          </div>
        </ShimmerBlock>
      ))}
    </div>
  );
}

export function GoalCardSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <ShimmerBlock key={i} delay={i * 100}>
          <div className="p-5 rounded-xl border border-border bg-surface">
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
              <div className="pt-2">
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          </div>
        </ShimmerBlock>
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-72 border-r border-border bg-sidebar p-5 space-y-6">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-9 w-9 rounded-xl skeleton-shimmer" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24 skeleton-shimmer" />
          <Skeleton className="h-3 w-16 skeleton-shimmer" />
        </div>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 flex-1 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-px w-full" />
      <div className="space-y-4">
        <Skeleton className="h-3 w-12" />
        {Array.from({ length: 3 }).map((_, i) => (
          <ShimmerBlock key={i} delay={i * 120}>
            <Skeleton className="h-16 w-full rounded-xl" />
          </ShimmerBlock>
        ))}
      </div>
    </div>
  );
}
