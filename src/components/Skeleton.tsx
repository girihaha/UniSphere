interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      className={`shimmer rounded-2xl ${className}`}
      style={style}
    />
  );
}

export function FeedCardSkeleton() {
  return (
    <div
      className="relative flex-shrink-0"
      style={{ height: '100dvh', scrollSnapAlign: 'start', background: '#0d1224' }}
    >
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-28 z-10 space-y-3">
        <div className="flex items-center gap-2.5">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" style={{ borderRadius: '50%' }} />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function ClubCardSkeleton() {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <Skeleton className="h-28 rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ConnectionCardSkeleton() {
  return (
    <div
      className="rounded-3xl p-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center gap-3.5">
        <Skeleton className="w-10 h-10 flex-shrink-0" style={{ borderRadius: '50%' }} />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="w-4 h-4 rounded-full" />
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div
      className="rounded-3xl p-4 mb-2.5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex gap-3">
        <Skeleton className="w-10 h-10 flex-shrink-0" style={{ borderRadius: '50%' }} />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-2.5 w-16" />
        </div>
      </div>
    </div>
  );
}
