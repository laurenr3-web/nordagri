import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode } from 'lucide-react';
import QRCodeGenerator from '../qr/QRCodeGenerator';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface Props { equipment: EquipmentItem; }

const QRCompactCard: React.FC<Props> = ({ equipment }) => (
  <Card id="equipment-qr-card" className="rounded-2xl border bg-card shadow-sm">
    <CardHeader className="pb-2">
      <CardTitle className="text-base flex items-center gap-2">
        <QrCode className="h-4 w-4 text-primary" /> QR code équipement
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-xs text-muted-foreground mb-3">
        Imprimez et collez sur la machine pour un accès rapide.
      </p>
      <QRCodeGenerator equipmentId={equipment.id} equipmentName={equipment.name} />
    </CardContent>
  </Card>
);

export default QRCompactCard;