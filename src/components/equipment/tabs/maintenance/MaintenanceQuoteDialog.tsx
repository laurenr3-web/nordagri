
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MaintenanceQuote from './MaintenanceQuote';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface MaintenanceQuoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance: any;
  onDelete?: (maintenanceId: number) => void;
}

const MaintenanceQuoteDialog: React.FC<MaintenanceQuoteDialogProps> = ({
  isOpen,
  onClose,
  maintenance,
  onDelete
}) => {
  if (!maintenance) return null;
  
  const handlePrint = () => {
    console.log('Impression du devis');
    window.print();
  };
  
  const handleDownload = () => {
    console.log('Téléchargement du devis');
    // Dans une implémentation réelle, on génèrerait un PDF
    toast.success("Devis téléchargé au format PDF");
  };
  
  const handleDelete = () => {
    if (maintenance && maintenance.id && onDelete) {
      onDelete(maintenance.id);
      onClose();
    } else {
      toast.error("Impossible de supprimer ce devis");
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Devis de maintenance</DialogTitle>
          {onDelete && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              className="flex items-center gap-1"
            >
              <Trash2 size={16} />
              Supprimer
            </Button>
          )}
        </DialogHeader>
        <MaintenanceQuote 
          maintenance={maintenance} 
          onPrint={handlePrint}
          onDownload={handleDownload}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MaintenanceQuoteDialog;
