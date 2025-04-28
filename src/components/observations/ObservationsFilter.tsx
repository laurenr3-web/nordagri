
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Calendar, Filter, X } from 'lucide-react';
import { ObservationType, UrgencyLevel } from '@/types/FieldObservation';
import { useEquipmentOptions } from '@/hooks/equipment/useEquipmentOptions';

interface ObservationsFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedEquipmentId: number | null;
  onEquipmentChange: (value: number | null) => void;
  selectedObservationType: ObservationType | null;
  onObservationTypeChange: (value: ObservationType | null) => void;
  selectedUrgencyLevel: UrgencyLevel | null;
  onUrgencyLevelChange: (value: UrgencyLevel | null) => void;
  onClearFilters: () => void;
}

export const ObservationsFilter: React.FC<ObservationsFilterProps> = ({
  searchQuery,
  onSearchChange,
  selectedEquipmentId,
  onEquipmentChange,
  selectedObservationType,
  onObservationTypeChange,
  selectedUrgencyLevel,
  onUrgencyLevelChange,
  onClearFilters,
}) => {
  const { data: equipments = [] } = useEquipmentOptions();

  const observationTypes: { value: ObservationType; label: string }[] = [
    { value: 'panne', label: 'Panne' },
    { value: 'usure', label: 'Usure' },
    { value: 'anomalie', label: 'Anomalie' },
    { value: 'entretien', label: 'Entretien nécessaire' },
    { value: 'autre', label: 'Autre' },
  ];

  const urgencyLevels: { value: UrgencyLevel; label: string }[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'surveiller', label: 'À surveiller' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedEquipmentId !== null ||
    selectedObservationType !== null ||
    selectedUrgencyLevel !== null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par mots-clés..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="ml-2 gap-1"
            >
              <X size={16} />
              <span className="hidden sm:inline">Effacer</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Select
            value={selectedEquipmentId?.toString() || ''}
            onValueChange={(value) =>
              onEquipmentChange(value ? parseInt(value, 10) : null)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Équipement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les équipements</SelectItem>
              {equipments.map((equipment) => (
                <SelectItem
                  key={equipment.id}
                  value={equipment.id.toString()}
                >
                  {equipment.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedObservationType || ''}
            onValueChange={(value) =>
              onObservationTypeChange(value as ObservationType || null)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Type d'observation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les types</SelectItem>
              {observationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedUrgencyLevel || ''}
            onValueChange={(value) =>
              onUrgencyLevelChange(value as UrgencyLevel || null)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Niveau d'urgence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les niveaux</SelectItem>
              {urgencyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
