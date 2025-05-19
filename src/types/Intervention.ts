
export interface Intervention {
  id: string | number;
  title: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  priority?: string;
  equipment?: {
    id: number;
    name: string;
    serialNumber?: string;
    model?: string;
  };
  partsUsed?: {
    id: number;
    name: string;
    quantity: number;
    unitPrice?: number;
  }[];
  notes?: string;
  _isOffline?: boolean;
}
