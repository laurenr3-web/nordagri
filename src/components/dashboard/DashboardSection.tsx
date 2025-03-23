
import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function DashboardSection({
  title,
  subtitle,
  children,
  action,
  className
}: DashboardSectionProps) {
  return (
    <section className={cn("mb-8", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium tracking-tight">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && (
          <div>{action}</div>
        )}
      </div>
      {children}
    </section>
  );
}
