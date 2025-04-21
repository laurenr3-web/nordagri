
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { useFuelLogs } from '@/hooks/equipment/useFuelLogs';
import { FuelLogDialog } from './fuel/FuelLogDialog';
import { FuelLogsTable } from './fuel/FuelLogsTable';
import { Plus } from 'lucide-react';

interface EquipmentPerformanceProps {
  equipment: EquipmentItem;
}

const EquipmentPerformance: React.FC<EquipmentPerformanceProps> = ({ equipment }) => {
  const {
    fuelLogs,
    isLoading,
    addFuelLog,
    isAddDialogOpen,
    setIsAddDialogOpen,
    deleteFuelLog
  } = useFuelLogs(equipment.id);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Calculate fuel statistics
  const totalFuel = fuelLogs?.reduce((sum, log) => sum + log.fuel_quantity_liters, 0) || 0;
  const totalCost = fuelLogs?.reduce((sum, log) => sum + log.total_cost, 0) || 0;
  const averageCostPerHour = equipment.usage?.hours ? totalCost / equipment.usage.hours : 0;

  // Données fictives pour démonstration
  const performanceData = [
    { month: 'Jan', heures: 45, consommation: 350 },
    { month: 'Fév', heures: 50, consommation: 370 },
    { month: 'Mar', heures: 55, consommation: 390 },
    { month: 'Avr', heures: 40, consommation: 320 },
    { month: 'Mai', heures: 60, consommation: 420 },
    { month: 'Juin', heures: 70, consommation: 520 }
  ];

  const handleDeleteLog = (id: string) => {
    setDeletingId(id);
    deleteFuelLog.mutate(id, {
      onSettled: () => setDeletingId(null),
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Suivi du carburant</CardTitle>
          <Button
            size="sm"
            className="ml-auto"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un plein
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-primary/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Consommation totale</h3>
              <p className="text-2xl font-bold">{totalFuel.toFixed(0)} L</p>
            </div>
            
            <div className="bg-green-500/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Coût total</h3>
              <p className="text-2xl font-bold">{totalCost.toFixed(2)} $</p>
            </div>
            
            <div className="bg-blue-500/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Coût horaire</h3>
              <p className="text-2xl font-bold">{averageCostPerHour.toFixed(2)} $/h</p>
            </div>
            
            <div className="bg-orange-500/10 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Dernier plein</h3>
              <p className="text-2xl font-bold">
                {fuelLogs?.[0]?.fuel_quantity_liters.toFixed(0) || '0'} L
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : fuelLogs?.length ? (
            <FuelLogsTable logs={fuelLogs} onDelete={handleDeleteLog} isDeletingId={deletingId} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucun plein enregistré
            </div>
          )}
        </CardContent>
      </Card>

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
              <p className="text-2xl font-bold">32 $/h</p>
              <p className="text-xs text-muted-foreground mt-1">Moyenne sur la période</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FuelLogDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={(values) => addFuelLog.mutate(values)}
        isSubmitting={addFuelLog.isPending}
        equipmentId={equipment.id}
      />
    </div>
  );
};

export default EquipmentPerformance;
