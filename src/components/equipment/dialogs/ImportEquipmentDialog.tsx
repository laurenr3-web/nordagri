
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Equipment } from '@/hooks/equipment/useEquipmentTable';

interface ImportEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: (data: Partial<Equipment>[]) => void;
}

const ImportEquipmentDialog: React.FC<ImportEquipmentDialogProps> = ({
  open,
  onOpenChange,
  onImportComplete
}) => {
  const [jsonData, setJsonData] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      if (!jsonData.trim()) {
        setError("Les données sont vides. Veuillez entrer un JSON valide.");
        return;
      }
      
      const parsedData = JSON.parse(jsonData);
      
      // Check if it's an array
      if (!Array.isArray(parsedData)) {
        setError("Les données importées doivent être un tableau d'objets.");
        return;
      }
      
      // Check if each item has a name
      const validData = parsedData.map((item, index) => {
        if (!item.name) {
          item.name = `Équipement importé ${index + 1}`;
        }
        return item;
      });
      
      // Call the import function
      onImportComplete(validData);
      
      // Reset form
      setJsonData('');
      setError(null);
    } catch (err) {
      setError("Format JSON invalide. Veuillez vérifier les données.");
      console.error("Import error:", err);
    }
  };

  const handleExampleData = () => {
    const exampleData = [
      {
        "name": "Tracteur New Holland",
        "type": "Tractor",
        "manufacturer": "New Holland",
        "model": "T7.270",
        "year": "2021",
        "serialNumber": "NH-T7270-001",
        "status": "operational",
        "location": "Hangar Nord"
      },
      {
        "name": "Pulvérisateur Amazone",
        "type": "sprayer",
        "manufacturer": "Amazone",
        "model": "UX 5201",
        "year": "2020",
        "status": "maintenance",
        "location": "Champ Est"
      }
    ];
    
    setJsonData(JSON.stringify(exampleData, null, 2));
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importer des équipements</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Collez vos données au format JSON ci-dessous. Chaque équipement doit avoir au moins un nom.
          </p>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Textarea 
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            placeholder='[{"name": "Tracteur Example", "type": "Tractor", "manufacturer": "Brand", "model": "X100"}]'
            className="min-h-[200px] font-mono text-sm"
          />
          
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleExampleData}>
              Données d'exemple
            </Button>
            
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="button" onClick={handleImport}>
                Importer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportEquipmentDialog;
