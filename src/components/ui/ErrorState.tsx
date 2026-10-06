"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "Failed to load content. Please check your connection and try again.",
  onRetry,
  className = "",
}) => {
  return (
    <GlassCard role="alert" className={`state-panel ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-500 mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-stone-500 dark:text-stone-400 mb-6 max-w-xs">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </Button>
      )}
    </GlassCard>
  );
};

export default ErrorState;
