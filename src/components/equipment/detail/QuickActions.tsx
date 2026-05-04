
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
    { icon: Clock, label: 'Compteur', onClick: onUpdateCounter, color: 'text-primary' },
    { icon: Wrench, label: 'Maintenance', onClick: onAddMaintenance, color: 'text-amber-600' },
    { icon: Eye, label: 'Point', onClick: onAddPoint, color: 'text-blue-600' },
    { icon: Activity, label: 'Intervention', onClick: onAddIntervention, color: 'text-violet-600' },
    { icon: Package, label: 'Pièce', onClick: onLinkPart, color: 'text-emerald-600' },
    { icon: QrCode, label: 'QR', onClick: onShowQR, color: 'text-foreground/70' },
  ];

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm" data-tour="equipment-quick-actions">
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map(({ icon: Icon, label, onClick, color }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/60 bg-background px-2 py-4 min-h-[88px] hover:bg-accent/60 hover:border-primary/40 transition-colors"
            >
              <Icon className={`h-5 w-5 ${color}`} />
              <span className="text-xs font-medium text-center leading-tight line-clamp-2 break-words">
                {label}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
