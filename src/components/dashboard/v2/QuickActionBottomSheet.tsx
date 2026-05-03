import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ClipboardPlus, Wrench, Eye, Fuel, QrCode, Tractor } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export const QuickActionBottomSheet: React.FC<Props> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  const actions = [
    { icon: ClipboardPlus, label: 'Nouvelle tâche', path: '/planning?new=1' },
    { icon: Eye, label: 'Point à surveiller', path: '/points?new=1' },
    { icon: Wrench, label: 'Maintenance', path: '/maintenance?new=1' },
    { icon: Fuel, label: 'Plein carburant', path: '/equipment?fuel=1' },
    { icon: QrCode, label: 'Scanner QR', path: '/equipment?scan=1' },
    { icon: Tractor, label: 'Équipements', path: '/equipment' },
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
          {actions.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              type="button"
              onClick={() => go(path)}
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
