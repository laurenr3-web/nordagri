
export interface EquipmentUsage {
  id: string;
  name: string;
  hoursToday: number;
  hoursWeek: number;
  hoursTotal: number;
  efficiency: number;
  maintenanceStatus: 'good' | 'warning' | 'critical';
}

export interface FieldUsage {
  id: string;
  name: string;
  area: string;
  hoursWorked: number;
  lastOperation: string;
  progress: number;
}

export const getMaintenanceStatusColor = (status: EquipmentUsage['maintenanceStatus']) => {
  switch (status) {
    case 'good': return 'text-green-500';
    case 'warning': return 'text-amber-500';
    case 'critical': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

export const getProgressColor = (progress: number) => {
  if (progress === 100) return 'bg-green-500';
  if (progress > 50) return 'bg-amber-500';
  if (progress > 0) return 'bg-blue-500';
  return 'bg-gray-300';
};
