
import React from 'react';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';
import { formatFieldValue } from '../utils/fieldFormatter';

interface ComparisonTableProps {
  equipment: EquipmentItem[];
}

const comparisonFields = [
  { key: 'name', label: 'Nom' },
  { key: 'type', label: 'Type' },
  { key: 'manufacturer', label: 'Fabricant' },
  { key: 'model', label: 'Modèle' },
  { key: 'year', label: 'Année' },
  { key: 'status', label: 'Statut' },
  { key: 'location', label: 'Localisation' },
  { key: 'serialNumber', label: 'N° de série' },
  { key: 'purchaseDate', label: 'Date d\'achat' }
];

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ equipment }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted/50 p-3 font-medium">
        Caractéristiques détaillées
      </div>
      {comparisonFields.map((field) => (
        <div key={field.key} className="border-t">
          <div className="grid gap-4 p-3" style={{ gridTemplateColumns: `150px repeat(${equipment.length}, 1fr)` }}>
            <div className="font-medium text-sm text-muted-foreground self-center">
              {field.label}
            </div>
            {equipment.map((item) => (
              <div key={item.id} className="text-sm">
                {formatFieldValue(item, field.key)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
