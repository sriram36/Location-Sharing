"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "dots" | "pulse" | "bars";
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  variant = "default", 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-blue-600 animate-pulse",
              size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1s"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className={cn(
          "rounded-full bg-blue-600 animate-pulse",
          sizeClasses[size]
        )} />
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-blue-600 animate-pulse",
              size === "sm" 
                ? "w-1 h-4" 
                : size === "md" 
                ? "w-1.5 h-6" 
                : "w-2 h-8"
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s"
            }}
          />
        ))}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size]
        )}
      />
    </div>
  );
}

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({ 
  message = "Loading...", 
  className 
}: LoadingScreenProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] space-y-4",
      className
    )}>
      <div className="relative">
        <LoadingSpinner size="lg" />
        <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping" />
      </div>
      <p className="text-lg font-medium text-gray-600 dark:text-gray-400 animate-pulse">
        {message}
      </p>
    </div>
  );
}