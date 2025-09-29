"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "online" | "offline" | "busy" | "away";
  label?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusIndicator({ 
  status, 
  label, 
  showLabel = false, 
  size = "md", 
  className 
}: StatusIndicatorProps) {
  const statusConfig = {
    online: {
      color: "bg-green-400",
      ringColor: "ring-green-400/30",
      label: label || "Online"
    },
    offline: {
      color: "bg-gray-400",
      ringColor: "ring-gray-400/30", 
      label: label || "Offline"
    },
    busy: {
      color: "bg-red-400",
      ringColor: "ring-red-400/30",
      label: label || "Busy"
    },
    away: {
      color: "bg-yellow-400", 
      ringColor: "ring-yellow-400/30",
      label: label || "Away"
    }
  };

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3", 
    lg: "h-4 w-4"
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="relative">
        <div
          className={cn(
            "rounded-full",
            sizeClasses[size],
            config.color,
            "ring-2 ring-offset-2 ring-offset-background",
            config.ringColor
          )}
        >
          {status === "online" && (
            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
          )}
        </div>
      </div>
      
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {config.label}
        </span>
      )}
    </div>
  );
}