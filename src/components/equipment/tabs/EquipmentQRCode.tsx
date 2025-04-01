
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
      <Card className="shadow-card overflow-hidden border-border">
        <CardHeader className="bg-gradient-to-r from-agri-dark to-agri-dark-hover text-white">
          <CardTitle>QR Code de l'équipement</CardTitle>
          <CardDescription className="text-agri-light">
            Générez, imprimez et gérez le QR code pour accéder rapidement à cet équipement
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
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
