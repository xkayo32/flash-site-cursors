import { cn } from '@/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-primary-100/60',
        className
      )}
      {...props}
    />
  );
}

// Skeleton específicos para o dashboard
export function StatCardSkeleton() {
  return (
    <div className="p-6 border border-primary-200 rounded-lg">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <Skeleton className="w-16 h-5" />
      </div>
      <Skeleton className="w-20 h-8 mb-2" />
      <Skeleton className="w-32 h-4 mb-4" />
      <Skeleton className="w-full h-2 rounded-full" />
    </div>
  );
}

export function GoalCardSkeleton() {
  return (
    <div className="p-4 border-2 border-gray-200 rounded-lg">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
      <Skeleton className="w-32 h-4 mb-2" />
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-8 h-4" />
      </div>
      <Skeleton className="w-full h-2 rounded-full" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-3 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-12 h-4" />
          </div>
          <Skeleton className="w-full h-2 rounded-full" />
        </div>
      ))}
    </div>
  );
}