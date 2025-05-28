
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import MaintenanceForm from './MaintenanceForm';
import MaintenanceQuote from './MaintenanceQuote';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface NewMaintenanceDialogProps {
  equipment: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (maintenance: any) => void;
}

const NewMaintenanceDialog: React.FC<NewMaintenanceDialogProps> = ({
  equipment,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [step, setStep] = useState<'form' | 'quote'>('form');
  const [maintenanceData, setMaintenanceData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const handleFormSubmit = (values: any) => {
    // Ajouter l'equipment au données du formulaire
    const maintenance = {
      ...values,
      equipment: {
        id: equipment.id,
        name: equipment.name,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
      },
      status: 'scheduled',
      id: Date.now(), // ID temporaire pour la démo
      // Conserver les heures moteur pour Supabase
      engine_hours: values.engineHours
    };
    
    setMaintenanceData(maintenance);
    setStep('quote');
  };

  const handleQuoteBack = () => {
    setStep('form');
  };

  const handleSaveQuote = async () => {
    try {
      setIsSubmitting(true);
      
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Appeler la fonction de soumission avec les données complètes
      onSubmit(maintenanceData);
      
      toast.success('Maintenance créée avec succès');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création de la maintenance:', error);
      toast.error("Échec de la création de la maintenance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintQuote = () => {
    toast.info('Impression du devis...');
    // Ici, vous pourriez implémenter la logique d'impression réelle
  };

  const handleDownloadQuote = () => {
    toast.info('Téléchargement du devis...');
    // Ici, vous pourriez implémenter la logique de téléchargement réelle
  };

  const renderContent = () => {
    if (step === 'form') {
      return (
        <MaintenanceForm 
          equipment={equipment} 
          onSubmit={handleFormSubmit} 
          onCancel={onClose}
        />
      );
    } else {
      return (
        <>
          <ScrollArea className={isMobile ? "h-[60vh]" : ""}>
            <MaintenanceQuote 
              maintenance={maintenanceData} 
              onPrint={handlePrintQuote}
              onDownload={handleDownloadQuote}
            />
          </ScrollArea>
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={handleQuoteBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <Button 
              onClick={handleSaveQuote}
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Enregistrement...' : 'Confirmer et enregistrer'}
            </Button>
          </div>
        </>
      );
    }
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {step === 'form' ? 'Nouvelle maintenance' : 'Devis de maintenance'}
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[95vh]">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' ? 'Nouvelle maintenance' : 'Devis de maintenance'}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' 
              ? `Créer une nouvelle tâche de maintenance pour ${equipment.name}` 
              : 'Vérifiez le devis de maintenance avant de confirmer'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewMaintenanceDialog;
