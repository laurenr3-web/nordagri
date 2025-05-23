
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { WidgetConfig } from '@/hooks/dashboard/useDashboardLayout';

interface DashboardCustomizerProps {
  widgets: WidgetConfig[];
  onToggleWidget: (id: string) => void;
  onResetLayout: () => void;
}

export const DashboardCustomizer = ({
  widgets,
  onToggleWidget,
  onResetLayout
}: DashboardCustomizerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">Widgets disponibles</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetLayout}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {widgets.map(widget => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={widget.enabled}
                    onCheckedChange={() => onToggleWidget(widget.id)}
                  />
                  <div>
                    <p className="text-sm font-medium">{widget.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {widget.size}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Glissez-déposez les widgets pour les réorganiser. 
            Utilisez le menu contextuel pour redimensionner.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
