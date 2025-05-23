
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
  badge?: string;
}

export const ModuleCard = ({
  title,
  description,
  icon: Icon,
  enabled,
  onToggle,
  disabled = false,
  badge
}: ModuleCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          "p-4 cursor-pointer transition-all",
          enabled ? "border-primary bg-primary/5" : "border-muted",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && onToggle()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-colors",
              enabled ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{title}</h4>
                {badge && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {description}
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={disabled}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </Card>
    </motion.div>
  );
};
