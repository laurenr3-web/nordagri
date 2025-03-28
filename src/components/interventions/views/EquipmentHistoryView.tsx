
import React, { useState } from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Intervention } from '@/types/Intervention';
import { formatDate } from '../utils/interventionUtils';
import PriorityBadge from '../PriorityBadge';
import StatusBadge from '../StatusBadge';

interface EquipmentHistoryViewProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
}

const EquipmentHistoryView: React.FC<EquipmentHistoryViewProps> = ({ 
  interventions, 
  onViewDetails 
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  
  // Get unique equipment names
  const equipments = [
    ...new Set(interventions.map(intervention => intervention.equipment))
  ];
  
  // Filter interventions by selected equipment
  const filteredInterventions = selectedEquipment === 'all' 
    ? interventions 
    : interventions.filter(intervention => intervention.equipment === selectedEquipment);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-medium">Historique des interventions par équipement</h3>
        
        <Select 
          value={selectedEquipment} 
          onValueChange={setSelectedEquipment}
        >
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Sélectionner un équipement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les équipements</SelectItem>
            {equipments.map(equipment => (
              <SelectItem key={equipment} value={equipment}>
                {equipment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {filteredInterventions.length === 0 ? (
        <BlurContainer className="p-8 text-center">
          <p className="text-muted-foreground">
            Aucune intervention trouvée pour {selectedEquipment === 'all' ? 'les équipements' : `"${selectedEquipment}"`}
          </p>
        </BlurContainer>
      ) : (
        <div className="space-y-4">
          {filteredInterventions.map(intervention => (
            <div 
              key={intervention.id}
              className="p-4 border rounded-md hover:bg-accent/10 transition-colors cursor-pointer"
              onClick={() => onViewDetails(intervention)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <div className="flex flex-col">
                  <h4 className="font-medium">{intervention.title}</h4>
                  <span className="text-sm text-muted-foreground">{intervention.equipment}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={intervention.priority} />
                  <StatusBadge status={intervention.status} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Date:</span>
                  <span>{formatDate(intervention.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Technicien:</span>
                  <span>{intervention.technician}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Lieu:</span>
                  <span>{intervention.location}</span>
                </div>
              </div>
              
              <Button 
                variant="link" 
                className="mt-2 h-auto p-0 text-sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(intervention);
                }}
              >
                Voir les détails
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentHistoryView;
