import React from 'react';
import { BookOpen, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HELP_CENTER_READY } from './constants';
import { useHelpCenter } from '@/contexts/HelpCenterContext';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateSecondaryAction {
  label: string;
  articleId: string;
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateSecondaryAction;
  variant?: 'default' | 'compact';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
}) => {
  const isCompact = variant === 'compact';
  const { open: openHelp } = useHelpCenter();

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center text-center mx-auto',
        isCompact
          ? 'py-6 px-4'
          : 'py-8 sm:py-12 px-4 max-w-md',
        className,
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          'text-muted-foreground/60',
          isCompact ? 'w-10 h-10 mb-2' : 'w-16 h-16 mb-4',
        )}
        strokeWidth={1.5}
      />

      {isCompact ? (
        <h4 className="text-base font-medium mb-1 text-foreground">{title}</h4>
      ) : (
        <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
      )}

      <p
        className={cn(
          'text-muted-foreground text-pretty',
          isCompact ? 'text-xs mb-3' : 'text-sm mb-6',
        )}
      >
        {description}
      </p>

      {action && (
        <Button
          type="button"
          onClick={action.onClick}
          size={isCompact ? 'sm' : 'default'}
        >
          {action.label}
        </Button>
      )}

      {!isCompact && secondaryAction && HELP_CENTER_READY && (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={() => openHelp(secondaryAction.articleId)}
          className="mt-2 text-xs text-muted-foreground underline-offset-4"
        >
          <BookOpen className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
          {secondaryAction.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;