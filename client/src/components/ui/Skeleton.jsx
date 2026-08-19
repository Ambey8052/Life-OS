export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-white/5 ${className}`} />;
}

export function SkeletonRows({ count = 4, className = "h-14" }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`w-full ${className}`} />
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 4, className = "h-24" }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  );
}
