
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ObservationType, UrgencyLevel } from '@/types/FieldObservation';
import { useEquipmentOptions } from '@/hooks/equipment/useEquipmentOptions';

interface EquipmentSelectProps {
  selectedEquipment: number | null;
  onEquipmentChange: (value: number) => void;
}

export const EquipmentSelect = ({ selectedEquipment, onEquipmentChange }: EquipmentSelectProps) => {
  const { data: equipments = [], isLoading: isLoadingEquipment } = useEquipmentOptions();
  
  return (
    <Select
      value={selectedEquipment?.toString()}
      onValueChange={(value) => onEquipmentChange(Number(value))}
      disabled={isLoadingEquipment}
    >
      <SelectTrigger>
        <SelectValue placeholder="Sélectionner l'équipement" />
      </SelectTrigger>
      <SelectContent>
        {equipments.map((equipment) => (
          <SelectItem key={equipment.id} value={equipment.id.toString()}>
            {equipment.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

interface ObservationTypeSelectProps {
  value?: ObservationType;
  onChange: (value: ObservationType) => void;
}

export const ObservationTypeSelect = ({ value, onChange }: ObservationTypeSelectProps) => (
  <Select
    value={value}
    onValueChange={(value) => onChange(value as ObservationType)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Type d'observation" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="panne">Panne</SelectItem>
      <SelectItem value="usure">Usure</SelectItem>
      <SelectItem value="maintenance">Maintenance</SelectItem>
      <SelectItem value="autre">Autre</SelectItem>
    </SelectContent>
  </Select>
);

interface UrgencyLevelSelectProps {
  value?: UrgencyLevel;
  onChange: (value: UrgencyLevel) => void;
}

export const UrgencyLevelSelect = ({ value, onChange }: UrgencyLevelSelectProps) => (
  <Select
    value={value}
    onValueChange={(value) => onChange(value as UrgencyLevel)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Niveau d'urgence" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="normal">Normal</SelectItem>
      <SelectItem value="surveiller">À surveiller</SelectItem>
      <SelectItem value="urgent">Urgent</SelectItem>
    </SelectContent>
  </Select>
);
