"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  disabled?: boolean;
}

export function ActionCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  className,
  color = "blue",
  disabled = false
}: ActionCardProps) {
  const colorClasses = {
    blue: {
      icon: "bg-blue-500 group-hover:bg-blue-600",
      border: "group-hover:border-blue-200 dark:group-hover:border-blue-800",
      shadow: "group-hover:shadow-blue-500/25"
    },
    green: {
      icon: "bg-green-500 group-hover:bg-green-600", 
      border: "group-hover:border-green-200 dark:group-hover:border-green-800",
      shadow: "group-hover:shadow-green-500/25"
    },
    purple: {
      icon: "bg-purple-500 group-hover:bg-purple-600",
      border: "group-hover:border-purple-200 dark:group-hover:border-purple-800", 
      shadow: "group-hover:shadow-purple-500/25"
    },
    orange: {
      icon: "bg-orange-500 group-hover:bg-orange-600",
      border: "group-hover:border-orange-200 dark:group-hover:border-orange-800",
      shadow: "group-hover:shadow-orange-500/25"
    },
    red: {
      icon: "bg-red-500 group-hover:bg-red-600",
      border: "group-hover:border-red-200 dark:group-hover:border-red-800",
      shadow: "group-hover:shadow-red-500/25"
    }
  };

  return (
    <div
      className={cn(
        "group glass-card interactive-card cursor-pointer rounded-xl p-6 transition-all duration-300",
        "hover:shadow-xl border-2 border-transparent",
        colorClasses[color].border,
        colorClasses[color].shadow,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Animated Icon */}
        <div className={cn(
          "p-4 rounded-xl transition-all duration-300 group-hover:scale-110",
          colorClasses[color].icon
        )}>
          <Icon className="h-8 w-8 text-white" />
        </div>
        
        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* Hover Arrow */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg 
            className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 8l4 4m0 0l-4 4m4-4H3" 
            />
          </svg>
        </div>
      </div>
    </div>
  );
}