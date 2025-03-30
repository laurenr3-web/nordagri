
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentImageGalleryProps {
  equipment: EquipmentItem;
}

const EquipmentImageGallery: React.FC<EquipmentImageGalleryProps> = ({ equipment }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Images</CardTitle>
        <CardDescription>Photos de l'équipement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full overflow-hidden rounded-md">
          <img
            src={equipment.image || "https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=1280&auto=format&fit=crop"}
            alt={equipment.name}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipmentImageGallery;
