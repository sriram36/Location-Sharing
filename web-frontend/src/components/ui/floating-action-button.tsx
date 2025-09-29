"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  tooltip?: string;
}

export function FloatingActionButton({
  icon: Icon,
  onClick,
  className,
  size = "md",
  variant = "primary",
  tooltip
}: FloatingActionButtonProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-14 h-14",
    lg: "w-16 h-16"
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const variantClasses = {
    primary: "gradient-primary hover:shadow-blue-500/50",
    secondary: "bg-gray-600 hover:bg-gray-700 hover:shadow-gray-500/50",
    success: "gradient-success hover:shadow-green-500/50",
    warning: "gradient-warning hover:shadow-yellow-500/50",
    danger: "gradient-danger hover:shadow-red-500/50"
  };

  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={cn(
          "fixed bottom-6 right-6 z-50 rounded-full text-white shadow-lg",
          "transition-all duration-300 hover:scale-110 hover:shadow-2xl",
          "flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-offset-2",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        title={tooltip}
      >
        <Icon className={cn("transition-transform duration-300 group-hover:rotate-12", iconSizes[size])} />
        
        {/* Pulse Ring */}
        <div className={cn(
          "absolute inset-0 rounded-full opacity-30 animate-ping",
          variantClasses[variant]
        )} />
      </button>
      
      {/* Tooltip */}
      {tooltip && (
        <div className="fixed bottom-20 right-6 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium shadow-lg">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
          </div>
        </div>
      )}
    </div>
  );
}