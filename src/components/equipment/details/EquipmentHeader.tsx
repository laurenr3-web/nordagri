
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash, ArrowLeft } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';
import MaintenanceAlert from './MaintenanceAlert';

interface EquipmentHeaderProps {
  equipment: any;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({
  equipment,
  onEditClick,
  onDeleteClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/equipment')}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Retour aux équipements</span>
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            <span className="hidden sm:inline">Modifier</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDeleteClick}
            className="flex items-center gap-1"
          >
            <Trash className="h-4 w-4" />
            <span className="hidden sm:inline">Supprimer</span>
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{equipment.name}</h1>
          <MaintenanceAlert equipment={equipment} showLabel={true} />
        </div>
        <StatusBadge status={equipment.status} />
      </div>

      <p className="text-muted-foreground">
        {equipment.brand} {equipment.model} {equipment.serialNumber ? `• ${equipment.serialNumber}` : ''}
      </p>
    </div>
  );
};

export default EquipmentHeader;
