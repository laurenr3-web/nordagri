
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface BaseSectionCardProps {
  title: string;
  icon: LucideIcon;
  partNumber: string;
  description: React.ReactNode;
  placeholder?: string;
  iconColor?: string;
}

export const BaseSectionCard: React.FC<BaseSectionCardProps> = ({ 
  title, 
  icon: Icon, 
  partNumber, 
  description, 
  placeholder,
  iconColor = "text-primary"
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {description ? (
          <div className="text-sm">{description}</div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            {placeholder || `Aucune information disponible pour ${partNumber}`}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
