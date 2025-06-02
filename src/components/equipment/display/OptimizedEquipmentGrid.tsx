
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { OptimizedEquipmentCard } from './OptimizedEquipmentCard';

interface OptimizedEquipmentGridProps {
  equipment: Array<any>;
  onEquipmentClick: (equipment: any) => void;
}

const OptimizedEquipmentGrid: React.FC<OptimizedEquipmentGridProps> = memo(({
  equipment,
  onEquipmentClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {equipment.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.02, // Reduced delay for faster rendering with many items
          }}
        >
          <OptimizedEquipmentCard
            name={item.name}
            type={item.type}
            category={item.category}
            image={item.image}
            status={item.status}
            usage={item.usage}
            nextService={item.nextService}
            onClick={() => onEquipmentClick(item)}
            index={index}
          />
        </motion.div>
      ))}
    </div>
  );
});

OptimizedEquipmentGrid.displayName = 'OptimizedEquipmentGrid';

export default OptimizedEquipmentGrid;
