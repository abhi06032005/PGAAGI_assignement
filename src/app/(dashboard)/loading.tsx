import { FeedSkeletonList, Skeleton } from "@/components/ui/Skeleton";
export default function Loading() {
  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <FeedSkeletonList count={3} />
    </div>
  );
}
