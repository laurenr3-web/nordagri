
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardCustomizer } from '@/components/dashboard/DashboardCustomizer';
import { WidgetConfig } from '@/hooks/dashboard/useDashboardLayout';

interface DashboardCustomizationProps {
  isCustomizing: boolean;
  widgets: WidgetConfig[];
  onToggleWidget: (id: string) => void;
  onResetLayout: () => void;
}

export const DashboardCustomization: React.FC<DashboardCustomizationProps> = ({
  isCustomizing,
  widgets,
  onToggleWidget,
  onResetLayout
}) => {
  return (
    <AnimatePresence>
      {isCustomizing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6"
        >
          <DashboardCustomizer
            widgets={widgets}
            onToggleWidget={onToggleWidget}
            onResetLayout={onResetLayout}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
