
import { MaintenanceTemplateItem } from '@/constants/maintenanceTemplates';

export interface ImportMaintenanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId?: number;
  equipmentName?: string;
}

export interface CustomMaintenanceItem extends Omit<MaintenanceTemplateItem, 'id'> {
  id?: string;
  selected: boolean;
}

export interface MaintenanceItemProps {
  item: MaintenanceTemplateItem & { selected: boolean };
  toggleMaintenanceItem: (id: string) => void;
  updateMaintenanceItemInterval: (id: string, interval: number) => void;
}

export interface CustomMaintenanceItemProps {
  item: CustomMaintenanceItem;
  index: number;
  updateCustomItem: (index: number, field: keyof CustomMaintenanceItem, value: any) => void;
  removeCustomItem: (index: number) => void;
}
