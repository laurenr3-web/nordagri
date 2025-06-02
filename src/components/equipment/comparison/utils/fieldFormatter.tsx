
import React from 'react';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';

export const formatFieldValue = (item: EquipmentItem, fieldKey: string): React.ReactNode => {
  const value = (item as any)[fieldKey];
  
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }
  
  // Handle special field types
  switch (fieldKey) {
    case 'status':
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      );
    case 'purchaseDate':
      return value instanceof Date ? value.toLocaleDateString() : String(value);
    case 'year':
      return String(value);
    default:
      // Handle complex objects by converting to string
      if (typeof value === 'object') {
        if (value.hours !== undefined) {
          return `${value.hours}h`;
        }
        return JSON.stringify(value);
      }
      return String(value);
  }
};
