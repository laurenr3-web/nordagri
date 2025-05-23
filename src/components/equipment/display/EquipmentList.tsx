
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import StatusBadge from '../details/StatusBadge';
import MaintenanceAlert from '../details/MaintenanceAlert';

interface EquipmentListProps {
  equipment: Array<any>;
  onEquipmentClick: (equipment: any) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({ 
  equipment,
  onEquipmentClick
}) => {
  const getEquipmentHours = (item: any) => {
    // Try to get hours from multiple possible sources
    const hours = item.usage?.hours || item.valeur_actuelle || 0;
    
    if (hours === 0) return 'N/A';
    
    // Format hours with proper separator for readability
    return `${hours.toLocaleString()}h`;
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Équipement</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="hidden md:table-cell">Marque/Modèle</TableHead>
            <TableHead className="hidden lg:table-cell">Localisation</TableHead>
            <TableHead className="hidden sm:table-cell">Heures</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((item, index) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="cursor-pointer hover:bg-muted transition-colors"
              onClick={() => onEquipmentClick(item)}
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded overflow-hidden bg-muted">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-primary/10">
                        <span className="text-xs text-primary">
                          {item.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <MaintenanceAlert equipment={item} size="sm" />
                    </div>
                    <span className="text-xs text-muted-foreground md:hidden">
                      {item.brand} {item.model}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {item.brand} {item.model}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {item.location || 'N/A'}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <span className="font-medium text-agri-900">
                  {getEquipmentHours(item)}
                </span>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EquipmentList;
