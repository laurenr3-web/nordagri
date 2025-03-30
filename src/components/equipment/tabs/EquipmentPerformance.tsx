
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentPerformanceProps {
  equipment: EquipmentItem;
}

const EquipmentPerformance: React.FC<EquipmentPerformanceProps> = ({ equipment }) => {
  // Données fictives pour démonstration
  const performanceData = [
    { month: 'Jan', heures: 45, consommation: 350 },
    { month: 'Fév', heures: 50, consommation: 370 },
    { month: 'Mar', heures: 55, consommation: 390 },
    { month: 'Avr', heures: 40, consommation: 320 },
    { month: 'Mai', heures: 60, consommation: 420 },
    { month: 'Juin', heures: 70, consommation: 520 }
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Utilisation mensuelle</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
              <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="heures" name="Heures d'utilisation" fill="#82ca9d" />
              <Bar yAxisId="right" dataKey="consommation" name="Consommation (L)" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Statistiques d'exploitation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Total heures</h3>
              <p className="text-2xl font-bold">320</p>
              <p className="text-xs text-muted-foreground mt-1">Depuis mise en service</p>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Rendement moyen</h3>
              <p className="text-2xl font-bold">85%</p>
              <p className="text-xs text-muted-foreground mt-1">Basé sur les 6 derniers mois</p>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Consommation</h3>
              <p className="text-2xl font-bold">2370 L</p>
              <p className="text-xs text-muted-foreground mt-1">Total consommé cette année</p>
            </div>
            
            <div className="bg-orange-500/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Coût opérationnel</h3>
              <p className="text-2xl font-bold">32 €/h</p>
              <p className="text-xs text-muted-foreground mt-1">Moyenne sur la période</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentPerformance;
