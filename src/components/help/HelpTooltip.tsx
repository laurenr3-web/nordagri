import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { tooltips } from '@/content/help/tooltips';
import { logger } from '@/utils/logger';
import { cn } from '@/lib/utils';
import { HELP_CENTER_READY } from './constants';
import { useHelpCenter } from '@/contexts/HelpCenterContext';

interface HelpTooltipProps {
  contentKey: string;
  size?: number;
  side?: 'top' | 'right' | 'bottom' | 'left';
  ariaLabel?: string;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  contentKey,
  size = 16,
  side = 'top',
  ariaLabel,
  className,
}) => {
  const content = (tooltips as Record<string, { title: string; body: string; articleId?: string }>)[contentKey];
  const { open } = useHelpCenter();

  if (!content) {
    logger.warn('[Help] Unknown tooltip key', { contentKey });
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label={ariaLabel ?? `Aide : ${content.title}`}
          className={cn(
            'inline-flex items-center justify-center rounded-full p-1',
            'text-muted-foreground hover:text-primary transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            className,
          )}
        >
          <HelpCircle style={{ width: size, height: size }} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        className="max-w-sm text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-semibold mb-1 text-foreground">{content.title}</p>
        <p className="text-muted-foreground leading-relaxed">{content.body}</p>
        {content.articleId && HELP_CENTER_READY && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              open(content.articleId);
            }}
            className="mt-2 text-xs text-primary underline underline-offset-2 hover:opacity-80"
          >
            En savoir plus →
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default HelpTooltip;