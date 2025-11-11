import { cn } from '@/lib/utils/cn';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('shimmer rounded-md bg-muted/50', className)}
      {...props}
    />
  );
}

export function GameCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border-2 border-border/50 bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
      <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900">
        <Skeleton className="h-full w-full rounded-none" />
        {/* Rating badge skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
        {/* Player count skeleton */}
        <div className="absolute bottom-3 left-3">
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </div>
      <div className="p-5 space-y-4">
        <Skeleton className="h-7 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function GameGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <GameCardSkeleton key={i} />
      ))}
    </div>
  );
}
