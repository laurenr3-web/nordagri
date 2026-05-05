
import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import StatusBadge from '../details/StatusBadge';
import MaintenanceAlert from '../details/MaintenanceAlert';
import { EquipmentImageFallback } from './EquipmentImageFallback';
import SignedImage from '@/components/ui/SignedImage';
import { Clock, Gauge } from 'lucide-react';

const variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

interface EquipmentGridProps {
  equipment: Array<any>;
  onEquipmentClick: (equipment: any) => void;
}

const formatWearValue = (value: number, unit: string) => {
  const formatted = value.toLocaleString('fr-FR');
  switch (unit) {
    case 'heures': return `${formatted} h`;
    case 'kilometres': return `${formatted} km`;
    case 'acres': return `${formatted} acres`;
    default: return `${formatted} ${unit}`;
  }
};

const EquipmentGrid: React.FC<EquipmentGridProps> = ({
  equipment,
  onEquipmentClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {equipment.map((item, index) => {
        const wearUnit = item.unite_d_usure || 'heures';
        const wearValue = item.valeur_actuelle || item.usage?.hours || 0;
        
        return (
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
              <div className="relative h-40 bg-muted/30">
                {item.image ? (
                  <SignedImage
                    storagePath={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain"
                    fallback={<EquipmentImageFallback item={item} />}
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
              <div className="p-4">
                <h3 className="font-semibold text-base leading-snug line-clamp-2 break-words safe-text">{item.name}</h3>
                {(item.brand || item.model) && (
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                    {[item.brand, item.model].filter(Boolean).join(' ')}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-2 text-sm font-medium text-primary">
                  {wearUnit === 'kilometres' ? (
                    <Gauge className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <Clock className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span>{formatWearValue(wearValue, wearUnit)}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default EquipmentGrid;
