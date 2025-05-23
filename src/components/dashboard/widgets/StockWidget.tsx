
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface StockWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

export const StockWidget = ({ data, loading, size }: StockWidgetProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  const displayLimit = size === 'small' ? 2 : size === 'medium' ? 3 : 5;
  const stockToShow = data?.slice(0, displayLimit) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Stock faible</h3>
        <Button variant="outline" size="sm">
          Gérer stock
        </Button>
      </div>
      
      <div className="space-y-2">
        {stockToShow.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 border rounded-lg"
          >
            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
              <Package className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                Stock: {item.currentStock}/{item.reorderPoint}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
