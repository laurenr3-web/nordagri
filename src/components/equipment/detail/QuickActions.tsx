import React, { useState } from 'react';
import { Gauge, Wrench, Eye, Package, Fuel, BarChart3, QrCode, ChevronDown, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface QuickActionsProps {
  onUpdateCounter: () => void;
  onAddMaintenance: () => void;
  onAddPoint: () => void;
  onLinkPart: () => void;
  onShowQR: () => void;
  onShowFuel?: () => void;
  onShowPerformance?: () => void;
}

interface ActionDef { icon: LucideIcon; label: string; onClick: () => void; color: string; }

const QuickActions: React.FC<QuickActionsProps> = ({
  onUpdateCounter, onAddMaintenance, onAddPoint, onLinkPart, onShowQR, onShowFuel, onShowPerformance,
}) => {
  const [more, setMore] = useState(false);

  const primary: ActionDef[] = [
    { icon: Gauge, label: 'Compteur', onClick: onUpdateCounter, color: 'text-primary' },
    { icon: Wrench, label: 'Maintenance', onClick: onAddMaintenance, color: 'text-amber-600' },
    { icon: Eye, label: 'Point', onClick: onAddPoint, color: 'text-blue-600' },
    { icon: QrCode, label: 'QR', onClick: onShowQR, color: 'text-foreground/70' },
  ];

  const secondary: ActionDef[] = [
    { icon: Package, label: 'Pièce', onClick: onLinkPart, color: 'text-emerald-600' },
    ...(onShowFuel ? [{ icon: Fuel, label: 'Carburant', onClick: onShowFuel, color: 'text-orange-600' }] : []),
    ...(onShowPerformance ? [{ icon: BarChart3, label: 'Performance', onClick: onShowPerformance, color: 'text-violet-600' }] : []),
  ];

  const renderBtn = (a: ActionDef) => (
    <button
      key={a.label}
      onClick={a.onClick}
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/60 bg-background px-2 py-3 min-h-[76px] hover:bg-accent/60 hover:border-primary/40 transition-colors"
    >
      <a.icon className={cn('h-5 w-5', a.color)} />
      <span className="text-[11px] font-medium text-center leading-tight">{a.label}</span>
    </button>
  );

  return (
    <Card className="rounded-2xl border border-border/60 bg-card shadow-sm" data-tour="equipment-quick-actions">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {primary.map(renderBtn)}
        </div>
        {secondary.length > 0 && (
          <>
            <button
              onClick={() => setMore((v) => !v)}
              className="w-full text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              Plus d'actions
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', more && 'rotate-180')} />
            </button>
            {more && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {secondary.map(renderBtn)}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickActions;
