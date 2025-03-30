
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentHistoryProps {
  equipment: EquipmentItem;
}

const EquipmentHistory: React.FC<EquipmentHistoryProps> = ({ equipment }) => {
  // Données fictives pour démonstration
  const historyData = [
    {
      id: 1,
      date: new Date(2023, 4, 15),
      type: 'Maintenance',
      description: 'Changement des filtres et huile',
      technician: 'Jean Dupont'
    },
    {
      id: 2,
      date: new Date(2023, 2, 10),
      type: 'Réparation',
      description: 'Remplacement du système hydraulique',
      technician: 'Marie Martin'
    },
    {
      id: 3,
      date: new Date(2023, 0, 5),
      type: 'Inspection',
      description: 'Contrôle technique annuel',
      technician: 'Pierre Dubois'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des interventions</CardTitle>
      </CardHeader>
      <CardContent>
        {historyData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Technicien</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {new Intl.DateTimeFormat('fr-FR').format(item.date)}
                  </TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.technician}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucun historique disponible</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentHistory;
