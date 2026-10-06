"use client";
import { ErrorState } from "@/components/ui/ErrorState";
export default function DashboardError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <ErrorState
      title="This view couldn't load"
      message="Please try again to return to your stories and saved discoveries."
      onRetry={retry}
    />
  );
}
