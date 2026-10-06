import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />;
}
export function CardSkeleton() {
  return (
    <div className="story-card skeleton-card" aria-hidden="true">
      <Skeleton className="story-image" />
      <div className="story-body">
        <Skeleton className="skeleton-meta" />
        <Skeleton className="skeleton-title" />
        <Skeleton className="skeleton-line" />
        <Skeleton className="skeleton-line !w-2/3" />
        <div className="story-bottom">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}
export function FeedSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div
      className="feed-skeletons"
      role="status"
      aria-label="Loading your feed"
    >
      <span className="sr-only">Loading your feed</span>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
export default Skeleton;
