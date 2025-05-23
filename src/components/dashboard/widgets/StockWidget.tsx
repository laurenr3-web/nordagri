
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Package, AlertTriangle, TrendingDown, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StockWidgetProps {
  data: any[];
  loading: boolean;
  size: 'small' | 'medium' | 'large' | 'full';
}

export const StockWidget = ({ data, loading, size }: StockWidgetProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-harvest-50 to-harvest-100 rounded-xl">
              <div className="w-10 h-10 bg-harvest-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-harvest-200 rounded w-3/4"></div>
                <div className="h-3 bg-harvest-150 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayLimit = size === 'small' ? 2 : size === 'medium' ? 3 : 5;
  const stockToShow = data?.slice(0, displayLimit) || [];

  const getStockLevel = (current: number, reorder: number) => {
    const percentage = (current / reorder) * 100;
    if (percentage <= 25) return { level: 'critical', color: 'red' };
    if (percentage <= 50) return { level: 'low', color: 'harvest' };
    return { level: 'normal', color: 'agri' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-agri-900">Stock faible</h3>
          <p className="text-sm text-agri-600 mt-1">Pièces à réapprovisionner</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-harvest-200 text-harvest-700 hover:bg-harvest-50 hover:border-harvest-300 transition-all duration-200"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Commander
        </Button>
      </div>
      
      <div className="space-y-3">
        {stockToShow.map((item, index) => {
          const stockInfo = getStockLevel(item.currentStock, item.reorderPoint);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={cn(
                "group relative overflow-hidden rounded-xl border transition-all duration-300",
                "hover:shadow-lg hover:scale-[1.02] cursor-pointer",
                stockInfo.level === 'critical' ? 'bg-red-50 border-red-200' :
                stockInfo.level === 'low' ? 'bg-harvest-50 border-harvest-200' :
                'bg-agri-50 border-agri-200'
              )}
            >
              <div className="flex items-center gap-4 p-4">
                <div className={cn(
                  "relative p-3 rounded-xl shadow-sm flex items-center justify-center",
                  stockInfo.level === 'critical' ? 'bg-gradient-to-br from-red-400 to-red-600' :
                  stockInfo.level === 'low' ? 'bg-gradient-to-br from-harvest-400 to-harvest-600' :
                  'bg-gradient-to-br from-agri-400 to-agri-600'
                )}>
                  <Package className="h-5 w-5 text-white" />
                  {stockInfo.level === 'critical' && (
                    <div className="absolute -top-1 -right-1">
                      <AlertTriangle className="h-4 w-4 text-red-500 fill-current animate-pulse" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-agri-900 group-hover:text-agri-700 transition-colors truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-1 ml-2">
                      <TrendingDown className={cn(
                        "h-4 w-4",
                        stockInfo.level === 'critical' ? 'text-red-500' :
                        stockInfo.level === 'low' ? 'text-harvest-500' :
                        'text-agri-500'
                      )} />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-agri-600">
                      Stock: <span className="font-medium">{item.currentStock}</span> / {item.reorderPoint}
                    </span>
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      stockInfo.level === 'critical' ? 'bg-red-100 text-red-700' :
                      stockInfo.level === 'low' ? 'bg-harvest-100 text-harvest-700' :
                      'bg-agri-100 text-agri-700'
                    )}>
                      {stockInfo.level === 'critical' ? 'Critique' :
                       stockInfo.level === 'low' ? 'Faible' : 'Normal'}
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={cn(
                        "h-2 rounded-full transition-all duration-500",
                        stockInfo.level === 'critical' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                        stockInfo.level === 'low' ? 'bg-gradient-to-r from-harvest-400 to-harvest-500' :
                        'bg-gradient-to-r from-agri-400 to-agri-500'
                      )}
                      style={{ 
                        width: `${Math.min((item.currentStock / item.reorderPoint) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.div>
          );
        })}
      </div>
      
      {stockToShow.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-agri-100 to-agri-200 rounded-full flex items-center justify-center">
            <Package className="h-8 w-8 text-agri-500" />
          </div>
          <p className="text-agri-600 font-medium">Stock suffisant</p>
          <p className="text-sm text-agri-500 mt-1">Tous les niveaux sont corrects</p>
        </div>
      )}
    </div>
  );
};
