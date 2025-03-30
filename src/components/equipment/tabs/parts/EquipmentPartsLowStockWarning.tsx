
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Part } from '@/types/Part';

interface EquipmentPartsLowStockWarningProps {
  parts: Part[];
}

const EquipmentPartsLowStockWarning: React.FC<EquipmentPartsLowStockWarningProps> = ({ parts }) => {
  // Filtrer les pièces avec stock faible (en dessous du point de réapprovisionnement)
  const lowStockParts = parts.filter(part => {
    const stock = typeof part.stock === 'number' ? part.stock : 
                 typeof part.quantity === 'number' ? part.quantity : 0;
                 
    const reorderPoint = typeof part.reorderPoint === 'number' ? part.reorderPoint : 
                         typeof part.minimumStock === 'number' ? part.minimumStock : 5;
                         
    return stock <= reorderPoint;
  });
  
  if (lowStockParts.length === 0) {
    return null;
  }
  
  return (
    <Alert variant="warning" className="mb-4 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Alerte de stock faible</AlertTitle>
      <AlertDescription className="text-amber-700">
        {lowStockParts.length === 1 ? (
          <p>La pièce <strong>{lowStockParts[0].name}</strong> a un stock faible et nécessite un réapprovisionnement.</p>
        ) : (
          <>
            <p>{lowStockParts.length} pièces ont un stock faible et nécessitent un réapprovisionnement:</p>
            <ul className="list-disc pl-5 mt-2">
              {lowStockParts.slice(0, 3).map(part => (
                <li key={part.id}>
                  <strong>{part.name}</strong> - Stock actuel: {part.stock || part.quantity || 0}
                </li>
              ))}
              {lowStockParts.length > 3 && (
                <li>...et {lowStockParts.length - 3} autres pièces</li>
              )}
            </ul>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default EquipmentPartsLowStockWarning;
