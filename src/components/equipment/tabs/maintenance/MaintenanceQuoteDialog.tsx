
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MaintenanceQuote from './MaintenanceQuote';
import { toast } from "@/hooks/use-toast";

interface MaintenanceQuoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  maintenance: any;
}

const MaintenanceQuoteDialog: React.FC<MaintenanceQuoteDialogProps> = ({
  isOpen,
  onClose,
  maintenance
}) => {
  if (!maintenance) return null;
  
  const handlePrint = () => {
    console.log('Impression du devis');
    window.print();
  };
  
  const handleDownload = () => {
    console.log('Téléchargement du devis');
    // Dans une implémentation réelle, on génèrerait un PDF
    toast({
      title: "Succès",
      description: "Devis téléchargé au format PDF",
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Devis de maintenance</DialogTitle>
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
