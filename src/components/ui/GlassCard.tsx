"use client";

import React from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "solid" | "interactive" | "pastel";
  pastelColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = "default",
  pastelColor,
  style,
  ...props
}) => {
  return (
    <div
      style={pastelColor ? { backgroundColor: pastelColor, ...style } : style}
      className={twMerge(
        clsx(
          "ui-panel transition-colors duration-200",
          // Interactive hover variant
          variant === "interactive" && "hover:shadow-md cursor-pointer",
          // Pastel variant
          variant === "pastel" && "shadow-sm",
          className,
        ),
      )}
      {...props}
    >
      {children}
    </div>
  );
};
export default GlassCard;
