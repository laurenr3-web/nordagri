
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MaintenanceQuoteProps {
  maintenance: any;
  onPrint?: () => void;
  onDownload?: () => void;
}

const MaintenanceQuote: React.FC<MaintenanceQuoteProps> = ({
  maintenance,
  onPrint = () => {},
  onDownload = () => {},
}) => {
  // Données simulées pour le devis
  const parts = [
    { id: 1, name: 'Filtre à huile', quantity: 1, unitPrice: 35.50, total: 35.50 },
    { id: 2, name: 'Huile moteur 10W40', quantity: 5, unitPrice: 12.99, total: 64.95 },
    { id: 3, name: 'Joint torique', quantity: 2, unitPrice: 3.75, total: 7.50 },
  ];
  
  const laborCost = 85 * maintenance.estimatedDuration; // Taux horaire de 85€
  const partsCost = parts.reduce((sum, part) => sum + part.total, 0);
  const totalCost = laborCost + partsCost;
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          Devis de maintenance
        </CardTitle>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-1" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4 mr-1" />
            Télécharger
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold">Informations</h3>
                <p className="text-sm">Référence: MNT-{maintenance.id}</p>
                <p className="text-sm">Date: {format(new Date(), 'dd/MM/yyyy', { locale: fr })}</p>
                <p className="text-sm">Date prévue: {format(maintenance.dueDate, 'dd/MM/yyyy', { locale: fr })}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold">Équipement</h3>
                <p className="text-sm">{maintenance.equipment.name}</p>
                <p className="text-sm">Modèle: {maintenance.equipment.model || '-'}</p>
                <p className="text-sm">Série: {maintenance.equipment.serialNumber || '-'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2">Détails de la maintenance</h3>
            <p className="text-sm mb-1">
              <span className="font-medium">Type: </span>
              <Badge variant="outline">
                {maintenance.type === 'preventive' ? 'Préventive' : 
                 maintenance.type === 'corrective' ? 'Corrective' : 'Conditionnelle'}
              </Badge>
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Priorité: </span>
              <Badge 
                className={
                  maintenance.priority === 'critical' ? 'bg-red-500 hover:bg-red-600' :
                  maintenance.priority === 'high' ? 'bg-orange-500 hover:bg-orange-600' :
                  maintenance.priority === 'medium' ? 'bg-blue-500 hover:bg-blue-600' :
                  'bg-green-500 hover:bg-green-600'
                }
              >
                {maintenance.priority === 'critical' ? 'Critique' :
                 maintenance.priority === 'high' ? 'Haute' :
                 maintenance.priority === 'medium' ? 'Moyenne' : 'Basse'}
              </Badge>
            </p>
            <p className="text-sm mb-3">
              <span className="font-medium">Durée estimée: </span>
              {maintenance.estimatedDuration} heure(s)
            </p>
            <p className="text-sm mb-4">
              <span className="font-medium">Description: </span>
              {maintenance.title}
            </p>
            {maintenance.notes && (
              <p className="text-sm mb-4">
                <span className="font-medium">Notes: </span>
                {maintenance.notes}
              </p>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-2">Pièces nécessaires</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>{part.name}</TableCell>
                    <TableCell className="text-right">{part.quantity}</TableCell>
                    <TableCell className="text-right">{part.unitPrice.toFixed(2)} €</TableCell>
                    <TableCell className="text-right">{part.total.toFixed(2)} €</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Coût des pièces:</span>
              <span>{partsCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Main d'œuvre ({maintenance.estimatedDuration}h × 85€/h):</span>
              <span>{laborCost.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between font-bold text-base mt-2">
              <span>Total:</span>
              <span>{totalCost.toFixed(2)} €</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-semibold text-blue-700 mb-1">Note:</p>
            <p className="text-blue-600">
              Ce devis est valable pour une durée de 30 jours à compter de sa date d'émission. 
              Des frais supplémentaires peuvent s'appliquer si des problèmes additionnels sont découverts pendant la maintenance.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceQuote;
