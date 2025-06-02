
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';
import { EquipmentImagesSection } from './components/EquipmentImagesSection';
import { ComparisonTable } from './components/ComparisonTable';
import { UsageComparison } from './components/UsageComparison';

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
            <EquipmentImagesSection 
              equipment={equipment} 
              onRemoveEquipment={onRemoveEquipment} 
            />

            {/* Comparison table */}
            <ComparisonTable equipment={equipment} />

            {/* Usage comparison if available */}
            <UsageComparison equipment={equipment} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
