
import React from 'react';
import { Clock, Wrench, Eye, Activity, Package, QrCode, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionsProps {
  onUpdateCounter: () => void;
  onAddMaintenance: () => void;
  onAddPoint: () => void;
  onAddIntervention: () => void;
  onLinkPart: () => void;
  onShowQR: () => void;
  unitLabel: string;
}

interface ActionDef {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  color: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onUpdateCounter,
  onAddMaintenance,
  onAddPoint,
  onAddIntervention,
  onLinkPart,
  onShowQR,
  unitLabel,
}) => {
  const actions: ActionDef[] = [
    { icon: Clock, label: unitLabel === 'Heures moteur' ? 'Heures' : 'Compteur', onClick: onUpdateCounter, color: 'text-primary' },
    { icon: Wrench, label: 'Maintenance', onClick: onAddMaintenance, color: 'text-amber-600' },
    { icon: Eye, label: 'Point', onClick: onAddPoint, color: 'text-blue-600' },
    { icon: Activity, label: 'Intervention', onClick: onAddIntervention, color: 'text-violet-600' },
    { icon: Package, label: 'Pièce', onClick: onLinkPart, color: 'text-emerald-600' },
    { icon: QrCode, label: 'QR', onClick: onShowQR, color: 'text-foreground/70' },
  ];

  return (
    <Card className="rounded-2xl border bg-card shadow-sm" data-tour="equipment-quick-actions">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {actions.map(({ icon: Icon, label, onClick, color }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border bg-background py-3 px-1 hover:bg-accent/60 hover:border-primary/40 transition-colors min-h-[64px]"
            >
              <Icon className={`h-5 w-5 ${color}`} />
              <span className="text-[11px] font-medium text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
