
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const PartsLoadingState: React.FC = () => {
  // Create an array of 5 items to loop through
  const items = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <div className="w-full">
      {/* Mobile Skeleton (hidden on desktop) */}
      <div className="md:hidden space-y-4">
        {items.map((i) => (
          <div key={`mobile-${i}`} className="flex gap-3 p-4 border-b last:border-0">
            <Skeleton className="h-4 w-4 mt-1" />
            <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop Skeleton (hidden on mobile) */}
      <table className="hidden md:table w-full">
        <thead>
          <tr className="bg-secondary/50">
            <th className="p-3 w-10"><Skeleton className="h-4 w-4" /></th>
            <th className="p-3 w-16"><Skeleton className="h-4 w-10" /></th>
            <th className="p-3"><Skeleton className="h-4 w-24" /></th>
            <th className="p-3"><Skeleton className="h-4 w-28" /></th>
            <th className="p-3"><Skeleton className="h-4 w-20" /></th>
            <th className="p-3"><Skeleton className="h-4 w-14" /></th>
            <th className="p-3"><Skeleton className="h-4 w-12" /></th>
            <th className="p-3"><Skeleton className="h-4 w-32" /></th>
            <th className="p-3"><Skeleton className="h-4 w-24" /></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((i) => (
            <tr key={`desktop-${i}`}>
              <td className="p-3"><Skeleton className="h-4 w-4" /></td>
              <td className="p-3"><Skeleton className="h-12 w-12 rounded-md" /></td>
              <td className="p-3"><Skeleton className="h-4 w-32" /></td>
              <td className="p-3"><Skeleton className="h-4 w-24" /></td>
              <td className="p-3"><Skeleton className="h-4 w-28" /></td>
              <td className="p-3"><Skeleton className="h-4 w-16" /></td>
              <td className="p-3"><Skeleton className="h-4 w-10" /></td>
              <td className="p-3"><Skeleton className="h-4 w-32" /></td>
              <td className="p-3">
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
