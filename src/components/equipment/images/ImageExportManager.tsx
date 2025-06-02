
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Download, Archive, Mail, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';

interface ImageExportManagerProps {
  equipment: EquipmentItem[];
  selectedEquipment?: EquipmentItem[];
  trigger?: React.ReactNode;
}

export const ImageExportManager: React.FC<ImageExportManagerProps> = ({
  equipment,
  selectedEquipment,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [exportFormat, setExportFormat] = useState<'zip' | 'pdf'>('zip');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const equipmentWithImages = equipment.filter(item => item.image && item.image !== 'nul');
  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Exporter les images
    </Button>
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(equipmentWithImages.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: number, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const simulateExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    const selectedEquipmentItems = equipmentWithImages.filter(item => selectedItems.has(item.id));
    
    for (let i = 0; i < selectedEquipmentItems.length; i++) {
      // Simulate download time
      await new Promise(resolve => setTimeout(resolve, 500));
      setExportProgress(((i + 1) / selectedEquipmentItems.length) * 100);
    }
    
    // Simulate final compression/packaging
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`${selectedEquipmentItems.length} images exportées avec succès`);
    setIsExporting(false);
    setExportProgress(0);
    setIsOpen(false);
  };

  const generateShareLink = () => {
    const selectedEquipmentItems = equipmentWithImages.filter(item => selectedItems.has(item.id));
    const shareData = {
      title: 'Photos d\'équipements',
      text: `Partage de ${selectedEquipmentItems.length} photos d'équipements`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exporter les images d'équipements</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {equipmentWithImages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun équipement avec image disponible
            </div>
          ) : (
            <>
              {/* Selection */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Sélection des équipements</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={selectedItems.size === equipmentWithImages.length}
                        onCheckedChange={handleSelectAll}
                      />
                      <label htmlFor="select-all" className="text-sm">
                        Tout sélectionner ({equipmentWithImages.length})
                      </label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {equipmentWithImages.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-2 border rounded">
                        <Checkbox
                          id={`equipment-${item.id}`}
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        />
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Options d'export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={exportFormat === 'zip' ? 'default' : 'outline'}
                      onClick={() => setExportFormat('zip')}
                      className="justify-start"
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive ZIP
                    </Button>
                    <Button
                      variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                      onClick={() => setExportFormat('pdf')}
                      className="justify-start"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Rapport PDF
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {exportFormat === 'zip' 
                      ? 'Les images seront téléchargées dans une archive ZIP compressée.'
                      : 'Un rapport PDF sera généré avec toutes les images et informations des équipements.'}
                  </div>
                </CardContent>
              </Card>

              {/* Progress */}
              {isExporting && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Export en cours...</span>
                        <span>{Math.round(exportProgress)}%</span>
                      </div>
                      <Progress value={exportProgress} />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={generateShareLink}
                    disabled={selectedItems.size === 0}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isExporting}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={simulateExport}
                    disabled={selectedItems.size === 0 || isExporting}
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Export...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Exporter ({selectedItems.size})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
