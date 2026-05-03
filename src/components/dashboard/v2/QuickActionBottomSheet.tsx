import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClipboardPlus, Wrench, Eye, Tractor, QrCode, Package } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const QuickActionBottomSheet: React.FC<Props> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const trigger = (path: string, eventName?: string) => {
    onOpenChange(false);
    navigate(path);
    if (eventName) {
      setTimeout(() => window.dispatchEvent(new CustomEvent(eventName)), 250);
    }
  };

  const actions: Array<{ icon: any; label: string; onClick: () => void }> = [
    { icon: ClipboardPlus, label: 'Nouvelle tâche', onClick: () => trigger('/planning', 'planning:open-add-task') },
    { icon: Eye, label: 'Point à surveiller', onClick: () => trigger('/points', 'points:n-point') },
    { icon: Wrench, label: 'Maintenance', onClick: () => trigger('/maintenance', 'maintenance:n-task') },
    { icon: Tractor, label: 'Nouvel équipement', onClick: () => trigger('/equipment', 'open-add-equipment-dialog') },
    { icon: QrCode, label: 'Scanner QR', onClick: () => trigger('/scan') },
    { icon: Package, label: 'Ajouter pièce', onClick: () => trigger('/parts') },
  ];

  const Grid = (
    <div className="grid grid-cols-3 gap-3">
      {actions.map(({ icon: Icon, label, onClick }, i) => (
        <button
          key={i}
          type="button"
          onClick={onClick}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border bg-card hover:bg-accent/40 transition-colors p-3 aspect-square"
        >
          <Icon className="h-6 w-6 text-primary" />
          <span className="text-[11px] font-medium leading-tight text-center line-clamp-2">
            {label}
          </span>
        </button>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl max-h-[70vh] pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        >
          <SheetHeader className="text-left">
            <SheetTitle>Action rapide</SheetTitle>
          </SheetHeader>
          <div className="mt-4">{Grid}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Action rapide</DialogTitle>
        </DialogHeader>
        <div className="mt-2">{Grid}</div>
      </DialogContent>
    </Dialog>
  );
};
