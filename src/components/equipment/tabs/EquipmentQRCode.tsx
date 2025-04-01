
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import EquipmentQRCodeManager from '../qr/EquipmentQRCodeManager';

interface EquipmentQRCodeProps {
  equipment: EquipmentItem;
}

const EquipmentQRCode: React.FC<EquipmentQRCodeProps> = ({ equipment }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Code de l'équipement</CardTitle>
          <CardDescription>
            Générez, imprimez et gérez le QR code pour accéder rapidement à cet équipement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EquipmentQRCodeManager 
            equipmentId={Number(equipment.id)} 
            equipmentName={equipment.name} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentQRCode;
