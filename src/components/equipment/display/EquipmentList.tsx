
import React, { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentListProps {
  equipment: EquipmentItem[];
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  handleEquipmentClick: (equipment: EquipmentItem) => void;
}

const EquipmentList: React.FC<EquipmentListProps> = ({
  equipment,
  getStatusColor,
  getStatusText,
  handleEquipmentClick,
}) => {
  // Safe click handler to prevent the "removeChild" error
  const handleClick = (item: EquipmentItem) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use setTimeout to ensure this happens outside the current event loop
    // This helps prevent React DOM manipulation conflicts
    setTimeout(() => {
      handleEquipmentClick(item);
    }, 0);
  };

  return (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Fabricant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Emplacement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((item) => (
              <TableRow 
                key={`equipment-list-${item.id}`}
                className="cursor-pointer hover:bg-muted/50"
                onClick={handleClick(item)}
              >
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.manufacturer}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(item.status)}`}>
                    {getStatusText(item.status)}
                  </Badge>
                </TableCell>
                <TableCell>{item.location || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ScrollArea>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default memo(EquipmentList);
