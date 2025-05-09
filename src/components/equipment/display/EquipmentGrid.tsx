
import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import StatusBadge from '../details/StatusBadge';
import MaintenanceAlert from '../details/MaintenanceAlert';
import { EquipmentImageFallback } from './EquipmentImageFallback';

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

interface EquipmentGridProps {
  equipment: Array<any>;
  onEquipmentClick: (equipment: any) => void;
}

const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  equipment,
  onEquipmentClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {equipment.map((item, index) => (
        <motion.div
          key={item.id}
          initial="hidden"
          animate="visible"
          variants={variants}
          transition={{
            duration: 0.3,
            delay: index * 0.1,
          }}
        >
          <Card
            className="relative overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer"
            onClick={() => onEquipmentClick(item)}
          >
            <div className="relative h-40">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <EquipmentImageFallback item={item} />
              )}
              <div className="absolute top-2 right-2">
                <StatusBadge status={item.status} />
              </div>
              <div className="absolute top-2 left-2">
                <MaintenanceAlert equipment={item} size="sm" />
              </div>
            </div>
            <div className="p-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold truncate flex-1">{item.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {item.brand} {item.model}
              </p>
              {item.location && (
                <p className="text-xs text-muted-foreground mt-1">{item.location}</p>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default EquipmentGrid;
