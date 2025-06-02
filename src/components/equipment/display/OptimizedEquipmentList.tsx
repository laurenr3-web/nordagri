
import React, { useState, memo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '../details/StatusBadge';
import MaintenanceAlert from '../details/MaintenanceAlert';
import { OptimizedEquipmentCard } from './OptimizedEquipmentCard';
import { ZoomIn, Tractor, Truck, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptimizedEquipmentListProps {
  equipment: Array<any>;
  onEquipmentClick: (equipment: any) => void;
}

const OptimizedEquipmentList: React.FC<OptimizedEquipmentListProps> = memo(({ 
  equipment,
  onEquipmentClick
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewEquipment, setPreviewEquipment] = useState<any>(null);

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'tracteur': return <Tractor className="h-5 w-5" />;
      case 'camion': case 'truck': return <Truck className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'tracteur': return 'bg-green-100 text-green-600';
      case 'camion': case 'truck': return 'bg-blue-100 text-blue-600';
      case 'moissonneuse': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getEquipmentHours = (item: any) => {
    const hours = item.usage?.hours || item.valeur_actuelle || 0;
    if (hours === 0) return 'N/A';
    return `${hours.toLocaleString()}h`;
  };

  const handleImageClick = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.image) {
      setPreviewImage(item.image);
      setPreviewEquipment(item);
    }
  };
  
  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Équipement</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden md:table-cell">Marque/Modèle</TableHead>
              <TableHead className="hidden lg:table-cell">Localisation</TableHead>
              <TableHead className="hidden sm:table-cell">Heures</TableHead>
              <TableHead className="w-16">Photo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onEquipmentClick(item)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className={cn("h-full w-full flex items-center justify-center", getCategoryColor(item.category))}>
                          {getCategoryIcon(item.category)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.name}</span>
                        <MaintenanceAlert equipment={item} size="sm" />
                      </div>
                      <span className="text-xs text-muted-foreground md:hidden truncate">
                        {item.manufacturer} {item.model}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={item.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="truncate">{item.manufacturer} {item.model}</span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="truncate">{item.location || 'N/A'}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="font-medium text-agri-900">
                    {getEquipmentHours(item)}
                  </span>
                </TableCell>
                <TableCell>
                  {item.image ? (
                    <button
                      onClick={(e) => handleImageClick(item, e)}
                      className="w-8 h-8 rounded-md bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors group"
                    >
                      <ZoomIn className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    </button>
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">N/A</span>
                    </div>
                  )}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-center">
              {previewEquipment?.name} - {previewEquipment?.type}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full flex justify-center">
            {previewImage && (
              <img
                src={previewImage}
                alt={previewEquipment?.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

OptimizedEquipmentList.displayName = 'OptimizedEquipmentList';

export default OptimizedEquipmentList;
