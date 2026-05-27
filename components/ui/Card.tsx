"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-ink-200/70 shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardSection({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between mb-3.5">
        <div>
          <h3 className="text-[14px] font-semibold text-ink-900 tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-[12px] text-ink-500 mt-0.5">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}
