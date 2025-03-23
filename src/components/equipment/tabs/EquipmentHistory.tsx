
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Truck, AlertTriangle, Settings, FileText } from 'lucide-react';

interface EquipmentHistoryProps {
  equipment: any;
}

const EquipmentHistory: React.FC<EquipmentHistoryProps> = ({ equipment }) => {
  // Mock history data - in a real app, this would come from an API
  const historyEvents = [
    {
      id: 1,
      date: '2023-10-15',
      type: 'maintenance',
      title: 'Regular Maintenance',
      description: 'Oil change and filter replacement',
      technician: 'Jean Dupont'
    },
    {
      id: 2,
      date: '2023-08-22',
      type: 'repair',
      title: 'Hydraulic System Repair',
      description: 'Replaced hydraulic pump and hoses',
      technician: 'Marie Laurent'
    },
    {
      id: 3,
      date: '2023-06-10',
      type: 'inspection',
      title: 'Annual Inspection',
      description: 'Comprehensive inspection of all systems',
      technician: 'Pierre Martin'
    },
    {
      id: 4,
      date: '2023-04-05',
      type: 'transfer',
      title: 'Location Transfer',
      description: 'Transferred from South Field to North Field',
      technician: 'Sophie Bernard'
    },
    {
      id: 5,
      date: '2023-02-18',
      type: 'documentation',
      title: 'Documentation Update',
      description: 'Updated equipment specifications and manuals',
      technician: 'Louis Mercier'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'repair':
        return <AlertTriangle className="h-4 w-4" />;
      case 'inspection':
        return <Settings className="h-4 w-4" />;
      case 'transfer':
        return <Truck className="h-4 w-4" />;
      case 'documentation':
        return <FileText className="h-4 w-4" />;
      default:
        return <Wrench className="h-4 w-4" />;
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Maintenance</Badge>;
      case 'repair':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Réparation</Badge>;
      case 'inspection':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">Inspection</Badge>;
      case 'transfer':
        return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">Transfert</Badge>;
      case 'documentation':
        return <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">Documentation</Badge>;
      default:
        return <Badge variant="outline">Autre</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Historique de l'équipement</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Titre</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Technicien</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyEvents.map(event => (
              <TableRow key={event.id}>
                <TableCell>{formatDate(event.date)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getEventIcon(event.type)}
                    {getEventBadge(event.type)}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{event.description}</TableCell>
                <TableCell>{event.technician}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EquipmentHistory;
