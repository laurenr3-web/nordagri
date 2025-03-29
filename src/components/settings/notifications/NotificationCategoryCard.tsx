
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { LucideIcon } from 'lucide-react';

interface NotificationCategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
  loading?: boolean;
}

export const NotificationCategoryCard = ({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  children,
  loading = false
}: NotificationCategoryCardProps) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-medium">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <Switch 
            checked={enabled}
            onCheckedChange={onToggle}
            disabled={loading}
          />
        </div>
        
        {enabled && children && (
          <div className="ml-8 space-y-3">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
