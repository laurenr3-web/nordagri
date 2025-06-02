
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'operational': return 'bg-green-100 text-green-800 border-green-200';
    case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'repair': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const formatFieldValue = (item: EquipmentItem, fieldKey: string): string | React.ReactElement => {
  const value = item[fieldKey as keyof EquipmentItem];
  
  // Handle status field with Badge component
  if (fieldKey === 'status') {
    return (
      <Badge variant="outline" className={getStatusColor(value as string)}>
        {value === 'operational' ? 'Opérationnel' :
         value === 'maintenance' ? 'Maintenance' :
         value === 'repair' ? 'Réparation' :
         value || 'Inconnu'}
      </Badge>
    );
  }
  
  // Handle usage field (object with hours and target)
  if (fieldKey === 'usage') {
    if (value && typeof value === 'object' && 'hours' in value) {
      const usage = value as { hours: number; target: number };
      return `${usage.hours}h`;
    }
    return 'N/A';
  }
  
  // Handle nextService field (object with type and due)
  if (fieldKey === 'nextService') {
    if (value && typeof value === 'object' && 'due' in value) {
      const nextService = value as { type: string; due: string };
      return nextService.due;
    }
    return 'N/A';
  }
  
  // Handle purchase date
  if (fieldKey === 'purchaseDate') {
    if (value instanceof Date) {
      return value.toLocaleDateString('fr-FR');
    }
    if (typeof value === 'string') {
      return new Date(value).toLocaleDateString('fr-FR');
    }
    return 'N/A';
  }
  
  // Handle null, undefined, or complex objects
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  // Handle primitive types only
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  
  // For any other type (objects, arrays, functions, etc.), return N/A
  return 'N/A';
};
