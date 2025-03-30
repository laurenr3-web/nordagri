
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Filter, BarChart } from 'lucide-react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart as RechartBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EquipmentHistoryProps {
  equipment: EquipmentItem;
}

const EquipmentHistory: React.FC<EquipmentHistoryProps> = ({ equipment }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  
  // Données fictives pour démonstration
  const currentYear = new Date().getFullYear();
  const historyData = [
    {
      id: 1,
      date: new Date(2023, 4, 15),
      type: 'maintenance',
      subtype: 'preventive',
      description: 'Changement des filtres et huile',
      technician: 'Jean Dupont',
      cost: 250.5,
      parts: ['Filtre à huile', 'Huile moteur 10W-40'],
      hours: 2.5
    },
    {
      id: 2,
      date: new Date(2023, 2, 10),
      type: 'repair',
      subtype: 'emergency',
      description: 'Remplacement du système hydraulique',
      technician: 'Marie Martin',
      cost: 1200,
      parts: ['Pompe hydraulique', 'Joints', 'Fluide hydraulique'],
      hours: 8
    },
    {
      id: 3,
      date: new Date(2023, 0, 5),
      type: 'inspection',
      subtype: 'routine',
      description: 'Contrôle technique annuel',
      technician: 'Pierre Dubois',
      cost: 150,
      parts: [],
      hours: 1.5
    },
    {
      id: 4,
      date: new Date(2022, 11, 12),
      type: 'maintenance',
      subtype: 'preventive',
      description: 'Révision annuelle des systèmes électriques',
      technician: 'Sophie Bernard',
      cost: 320,
      parts: ['Fusibles', 'Câbles électriques'],
      hours: 3
    },
    {
      id: 5,
      date: new Date(2022, 9, 28),
      type: 'repair',
      subtype: 'scheduled',
      description: 'Réparation des phares avant',
      technician: 'Jean Dupont',
      cost: 180,
      parts: ['Ampoules LED', 'Connecteurs'],
      hours: 1
    },
    {
      id: 6,
      date: new Date(2022, 7, 15),
      type: 'maintenance',
      subtype: 'preventive',
      description: 'Graissage général et lubrification',
      technician: 'Marie Martin',
      cost: 120,
      parts: ['Graisse multi-usage', 'Lubrifiant'],
      hours: 2
    }
  ];

  const years = ['all', ...Array.from(new Set(historyData.map(item => item.date.getFullYear()))).sort((a, b) => b - a).map(year => year.toString())];

  const filteredHistory = historyData.filter(item => {
    if (activeTab !== 'all' && item.type !== activeTab) return false;
    if (yearFilter !== 'all' && item.date.getFullYear().toString() !== yearFilter) return false;
    return true;
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  // Données pour le graphique
  const getChartData = () => {
    const years = Array.from(new Set(historyData.map(item => item.date.getFullYear()))).sort();
    
    return years.map(year => {
      const yearData = historyData.filter(item => item.date.getFullYear() === year);
      
      return {
        year,
        maintenance: yearData
          .filter(item => item.type === 'maintenance')
          .reduce((sum, item) => sum + item.cost, 0),
        repair: yearData
          .filter(item => item.type === 'repair')
          .reduce((sum, item) => sum + item.cost, 0),
        inspection: yearData
          .filter(item => item.type === 'inspection')
          .reduce((sum, item) => sum + item.cost, 0),
        hours: yearData.reduce((sum, item) => sum + item.hours, 0)
      };
    });
  };

  const chartData = getChartData();
  
  // Coût total
  const totalCost = historyData.reduce((sum, item) => sum + item.cost, 0);
  
  // Coût par année
  const costByYear = years
    .filter(year => year !== 'all')
    .map(year => {
      const yearData = historyData.filter(item => item.date.getFullYear().toString() === year);
      return {
        year,
        cost: yearData.reduce((sum, item) => sum + item.cost, 0)
      };
    });
  
  // Heures de travail totales
  const totalHours = historyData.reduce((sum, item) => sum + item.hours, 0);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR').format(date);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'maintenance': return 'bg-blue-500 hover:bg-blue-600';
      case 'repair': return 'bg-red-500 hover:bg-red-600';
      case 'inspection': return 'bg-green-500 hover:bg-green-600';
      default: return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'maintenance': return 'Maintenance';
      case 'repair': return 'Réparation';
      case 'inspection': return 'Inspection';
      default: return type;
    }
  };

  const getSubtypeName = (subtype: string) => {
    switch (subtype) {
      case 'preventive': return 'Préventive';
      case 'emergency': return 'Urgence';
      case 'routine': return 'Routine';
      case 'scheduled': return 'Planifiée';
      default: return subtype;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Historique des interventions</h2>
        
        <div className="flex space-x-2">
          <div className="bg-card border rounded-md p-2">
            <div className="text-xs font-medium mb-1 text-muted-foreground">Année</div>
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-transparent border-none text-foreground focus:outline-none text-sm p-0"
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? 'Toutes les années' : year}
                </option>
              ))}
            </select>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Tout</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="repair">Réparation</TabsTrigger>
              <TabsTrigger value="inspection">Inspection</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-blue-500" />
              Coût total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCost.toLocaleString('fr-FR')} €</p>
            <p className="text-sm text-muted-foreground">
              Pour {historyData.length} interventions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2 text-green-500" />
              Coût cette année
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {historyData
                .filter(item => item.date.getFullYear() === currentYear)
                .reduce((sum, item) => sum + item.cost, 0)
                .toLocaleString('fr-FR')} €
            </p>
            <p className="text-sm text-muted-foreground">
              {historyData.filter(item => item.date.getFullYear() === currentYear).length} interventions en {currentYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BarChart className="h-4 w-4 mr-2 text-orange-500" />
              Temps de travail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalHours} heures</p>
            <p className="text-sm text-muted-foreground">
              Temps total de maintenance
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyse des coûts</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartBarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString('fr-FR')} €`} />
              <Legend />
              <Bar dataKey="maintenance" name="Maintenance" fill="#3b82f6" />
              <Bar dataKey="repair" name="Réparation" fill="#ef4444" />
              <Bar dataKey="inspection" name="Inspection" fill="#22c55e" />
            </RechartBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détail des interventions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Technicien</TableHead>
                  <TableHead>Coût</TableHead>
                  <TableHead>Pièces utilisées</TableHead>
                  <TableHead>Heures</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {formatDate(item.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <Badge className={getTypeColor(item.type)}>
                          {getTypeName(item.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getSubtypeName(item.subtype)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.technician}</TableCell>
                    <TableCell>{item.cost.toLocaleString('fr-FR')} €</TableCell>
                    <TableCell>
                      {item.parts.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.parts.map((part, index) => (
                            <Badge key={index} variant="outline">
                              {part}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Aucune</span>
                      )}
                    </TableCell>
                    <TableCell>{item.hours}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune intervention trouvée pour les filtres actuels</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => {
                  setActiveTab('all');
                  setYearFilter('all');
                }}
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentHistory;
