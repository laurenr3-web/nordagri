
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { Trash2, Download, Wrench } from 'lucide-react';
import { Intervention } from '@/types/Intervention';

interface DialogFooterActionsProps {
  intervention: Intervention;
  onSetDeleteAlertOpen: (open: boolean) => void;
  onExportToPDF: () => void;
  onStartWork: () => void;
}

const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({
  intervention,
  onSetDeleteAlertOpen,
  onExportToPDF,
  onStartWork
}) => {
  return (
    <div className="gap-2 sm:gap-0 flex items-center w-full">
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onSetDeleteAlertOpen(true)}
        className="gap-1"
      >
        <Trash2 size={16} />
        <span>Supprimer</span>
      </Button>
      <div className="flex gap-2 ml-auto">
        <Button 
          variant="outline" 
          size="sm"
          className="gap-1"
          onClick={onExportToPDF}
        >
          <Download size={16} />
          <span>Exporter PDF</span>
        </Button>
        {intervention.status === 'scheduled' && (
          <Button 
            variant="outline" 
            size="sm"
            className="gap-1"
            onClick={onStartWork}
          >
            <Wrench size={16} />
            <span>Démarrer</span>
          </Button>
        )}
        <DialogClose asChild>
          <Button size="sm">Fermer</Button>
        </DialogClose>
      </div>
    </div>
  );
};

export default DialogFooterActions;
