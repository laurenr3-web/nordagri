
import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'card' | 'list' | 'table' | 'grid' | 'text' | 'avatar';
  count?: number;
}

export function SkeletonLoader({ 
  className, 
  variant = 'card', 
  count = 1 
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-3 w-3/5 rounded" />
            <div className="flex items-center space-x-2 pt-2">
              <Skeleton className="h-2 w-8 rounded" />
              <Skeleton className="h-2 w-16 rounded" />
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="space-y-2 py-1">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        );
      case 'table':
        return (
          <div className="space-y-1 py-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          </div>
        );
      case 'grid':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Array(count).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-video w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        );
      case 'text':
        return (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        );
      case 'avatar':
        return (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        );
      default:
        return <Skeleton className={cn("h-10 w-full", className)} />;
    }
  };

  if (variant === 'grid') {
    return renderSkeleton();
  }

  return (
    <div className={cn("w-full", className)}>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="mb-3">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}
