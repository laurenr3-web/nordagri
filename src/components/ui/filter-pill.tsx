
import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { transitions } from '@/lib/design-system';

interface FilterPillProps {
  label: string;
  value?: string | number;
  onRemove?: () => void;
  className?: string;
  active?: boolean;
}

export function FilterPill({ label, value, onRemove, className, active = true }: FilterPillProps) {
  return (
    <Badge
      variant={active ? "default" : "outline"}
      className={cn(
        "group gap-1 px-2 py-1 cursor-default",
        onRemove && "pr-1",
        transitions.default,
        className
      )}
    >
      <span className="truncate">
        {label}
        {value !== undefined && ': '}
        {value !== undefined && (
          <span className="font-semibold">{value}</span>
        )}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={cn(
            "ml-1 rounded-full p-0.5",
            "opacity-70 hover:opacity-100",
            "group-hover:bg-primary-foreground/20",
            transitions.default
          )}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Retirer</span>
        </button>
      )}
    </Badge>
  );
}
