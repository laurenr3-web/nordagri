
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentListProps {
  equipment: EquipmentItem[];
  getStatusColor: (status: string | undefined) => string;
  getStatusText: (status: string | undefined) => string;
  handleEquipmentClick: (equipment: EquipmentItem) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  equipment,
  getStatusColor,
  getStatusText,
  handleEquipmentClick
}) => {
  return (
    <div className="overflow-x-auto shadow-sm rounded-lg border h-full">
      <Table>
        <TableHeader className="bg-muted/40 sticky top-0 z-10">
          <TableRow>
            <TableHead className="w-[80px] py-3">Image</TableHead>
            <TableHead className="py-3">Nom</TableHead>
            <TableHead className="py-3">Type</TableHead>
            <TableHead className="py-3">Fabricant</TableHead>
            <TableHead className="py-3">Modèle</TableHead>
            <TableHead className="py-3">Année</TableHead>
            <TableHead className="py-3">Statut</TableHead>
            <TableHead className="py-3">Emplacement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((item) => (
            <TableRow 
              key={item.id} 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleEquipmentClick(item)}
            >
              <TableCell className="py-2">
                <div className="w-16 h-12 overflow-hidden rounded-md">
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop"}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium py-2">{item.name}</TableCell>
              <TableCell className="py-2">{item.type || '-'}</TableCell>
              <TableCell className="py-2">{item.manufacturer || '-'}</TableCell>
              <TableCell className="py-2">{item.model || '-'}</TableCell>
              <TableCell className="py-2">{item.year || '-'}</TableCell>
              <TableCell className="py-2">
                <Badge className={getStatusColor(item.status)} variant="secondary">
                  {getStatusText(item.status)}
                </Badge>
              </TableCell>
              <TableCell className="py-2">{item.location || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EquipmentList;
