
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Download, FileText } from 'lucide-react';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';
import { cn } from '@/lib/utils';

interface EquipmentComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: EquipmentItem[];
  onRemoveEquipment: (id: number) => void;
}

export const EquipmentComparison: React.FC<EquipmentComparisonProps> = ({
  isOpen,
  onClose,
  equipment,
  onRemoveEquipment
}) => {
  const [exportingPDF, setExportingPDF] = useState(false);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'repair': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportToPDF = async () => {
    setExportingPDF(true);
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('PDF export completed');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExportingPDF(false);
    }
  };

  const formatFieldValue = (item: EquipmentItem, fieldKey: string): string | React.ReactElement => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Comparaison d'équipements ({equipment.length})</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                disabled={exportingPDF}
              >
                {exportingPDF ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Exporter PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        {equipment.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun équipement sélectionné pour la comparaison
          </div>
        ) : (
          <div className="space-y-6">
            {/* Images */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${equipment.length}, 1fr)` }}>
              {equipment.map((item) => (
                <Card key={item.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                    onClick={() => onRemoveEquipment(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">Aucune image</span>
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Comparison table */}
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

            {/* Usage comparison if available */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Utilisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${equipment.length}, 1fr)` }}>
                  {equipment.map((item) => (
                    <div key={item.id} className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {(item as any).usage?.hours || (item as any).valeur_actuelle || 0}h
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Heures d'utilisation
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
