"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  className?: string;
  gradient?: "primary" | "success" | "warning" | "danger";
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  className,
  gradient = "primary" 
}: StatsCardProps) {
  const gradientClasses = {
    primary: "gradient-primary",
    success: "gradient-success", 
    warning: "gradient-warning",
    danger: "gradient-danger"
  };

  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400", 
    neutral: "text-gray-600 dark:text-gray-400"
  };

  return (
    <div className={cn(
      "glass-card hover-lift animate-slide-up rounded-xl p-6 relative overflow-hidden",
      className
    )}>
      {/* Gradient Background */}
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-xl",
        gradientClasses[gradient]
      )} />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-3 rounded-lg",
            gradientClasses[gradient]
          )}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          
          {change && (
            <div className={cn(
              "flex items-center text-sm font-medium",
              trendColors[change.trend]
            )}>
              <span>{change.value}</span>
              {change.trend === "up" && (
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" />
                </svg>
              )}
              {change.trend === "down" && (
                <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" />
                </svg>
              )}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}