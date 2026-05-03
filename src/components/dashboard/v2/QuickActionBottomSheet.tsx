import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ClipboardPlus, Wrench, Eye, Tractor, ClipboardList, Plus } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const QuickActionBottomSheet: React.FC<Props> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();

  const trigger = (path: string, eventName?: string) => {
    onOpenChange(false);
    navigate(path);
    if (eventName) {
      // give the target page time to mount its listener
      setTimeout(() => window.dispatchEvent(new CustomEvent(eventName)), 280);
    }
  };

  const actions: Array<{ icon: any; label: string; onClick: () => void }> = [
    { icon: ClipboardPlus, label: 'Nouvelle tâche', onClick: () => trigger('/planning', 'planning:n-task') },
    { icon: Eye, label: 'Point à surveiller', onClick: () => trigger('/points', 'points:n-point') },
    { icon: Wrench, label: 'Maintenance', onClick: () => trigger('/maintenance', 'maintenance:n-task') },
    { icon: Tractor, label: 'Nouvel équipement', onClick: () => trigger('/equipment', 'n-equipment-dialog') },
    { icon: ClipboardList, label: 'Voir planification', onClick: () => trigger('/planning') },
    { icon: Plus, label: 'Voir équipements', onClick: () => trigger('/equipment') },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl pb-[calc(env(safe-area-inset-bottom)+1rem)]"
      >
        <SheetHeader className="text-left">
          <SheetTitle>Action rapide</SheetTitle>
        </SheetHeader>
        <div className="mt-4 grid grid-cols-3 gap-3">
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
      </SheetContent>
    </Sheet>
  );
};
