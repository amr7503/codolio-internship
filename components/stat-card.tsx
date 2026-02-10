"use client";

import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  suffix?: string;
  color: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  suffix = "",
  color,
}: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl glass-strong p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Background gradient accent */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
        style={{ background: color }}
      />

      <div className="relative flex items-center gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${color}15`, color }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-heading text-foreground">
            <AnimatedCounter target={value} suffix={suffix} />
          </p>
        </div>
      </div>

      {/* Subtle bottom border accent */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: color }}
      />
    </div>
  );
}
