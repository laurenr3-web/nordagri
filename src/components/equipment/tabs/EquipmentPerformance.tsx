
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, Legend, Tooltip } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EquipmentPerformanceProps {
  equipment: any;
}

const EquipmentPerformance: React.FC<EquipmentPerformanceProps> = ({ equipment }) => {
  // Mock performance data
  const monthlyUsageData = [
    { month: 'Jan', hours: 42, target: 50 },
    { month: 'Feb', hours: 38, target: 50 },
    { month: 'Mar', hours: 55, target: 50 },
    { month: 'Apr', hours: 60, target: 50 },
    { month: 'May', hours: 48, target: 50 },
    { month: 'Jun', hours: 35, target: 50 },
    { month: 'Jul', hours: 62, target: 50 },
    { month: 'Aug', hours: 58, target: 50 },
    { month: 'Sep', hours: 45, target: 50 },
    { month: 'Oct', hours: 52, target: 50 },
    { month: 'Nov', hours: 0, target: 50 },
    { month: 'Dec', hours: 0, target: 50 }
  ];

  const maintenanceData = [
    { month: 'Jan', cost: 0 },
    { month: 'Feb', cost: 350 },
    { month: 'Mar', cost: 0 },
    { month: 'Apr', cost: 150 },
    { month: 'May', cost: 0 },
    { month: 'Jun', cost: 1200 },
    { month: 'Jul', cost: 0 },
    { month: 'Aug', cost: 450 },
    { month: 'Sep', cost: 0 },
    { month: 'Oct', cost: 275 },
    { month: 'Nov', cost: 0 },
    { month: 'Dec', cost: 0 }
  ];

  const fuelConsumptionData = [
    { month: 'Jan', consumption: 320 },
    { month: 'Feb', consumption: 280 },
    { month: 'Mar', consumption: 410 },
    { month: 'Apr', consumption: 450 },
    { month: 'May', consumption: 350 },
    { month: 'Jun', consumption: 260 },
    { month: 'Jul', consumption: 470 },
    { month: 'Aug', consumption: 430 },
    { month: 'Sep', consumption: 340 },
    { month: 'Oct', consumption: 390 },
    { month: 'Nov', consumption: 0 },
    { month: 'Dec', consumption: 0 }
  ];

  const efficiencyData = [
    { month: 'Jan', efficiency: 92 },
    { month: 'Feb', efficiency: 88 },
    { month: 'Mar', efficiency: 94 },
    { month: 'Apr', efficiency: 87 },
    { month: 'May', efficiency: 91 },
    { month: 'Jun', efficiency: 85 },
    { month: 'Jul', efficiency: 93 },
    { month: 'Aug', efficiency: 90 },
    { month: 'Sep', efficiency: 89 },
    { month: 'Oct', efficiency: 92 },
    { month: 'Nov', efficiency: 0 },
    { month: 'Dec', efficiency: 0 }
  ];

  const chartConfig = {
    hours: { label: "Heures d'utilisation", color: "#3498db" },
    target: { label: "Objectif", color: "#e74c3c" },
    cost: { label: "Coût de maintenance", color: "#9b59b6" },
    consumption: { label: "Consommation de carburant", color: "#f39c12" },
    efficiency: { label: "Efficacité", color: "#2ecc71" }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Analyse des performances</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="usage" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="usage">Utilisation</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="fuel">Carburant</TabsTrigger>
              <TabsTrigger value="efficiency">Efficacité</TabsTrigger>
            </TabsList>
            
            <TabsContent value="usage">
              <div className="h-80">
                <ChartContainer config={chartConfig}>
                  <BarChart data={monthlyUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="hours" name="hours" fill="var(--color-hours)" />
                    <Bar dataKey="target" name="target" fill="var(--color-target)" />
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Utilisation mensuelle de l'équipement comparée à l'objectif cible de 50 heures par mois.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="maintenance">
              <div className="h-80">
                <ChartContainer config={chartConfig}>
                  <BarChart data={maintenanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="cost" name="cost" fill="var(--color-cost)" />
                  </BarChart>
                </ChartContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Coûts mensuels de maintenance et de réparation pour cet équipement.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="fuel">
              <div className="h-80">
                <ChartContainer config={chartConfig}>
                  <LineChart data={fuelConsumptionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="consumption" name="consumption" stroke="var(--color-consumption)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Consommation mensuelle de carburant en litres.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="efficiency">
              <div className="h-80">
                <ChartContainer config={chartConfig}>
                  <LineChart data={efficiencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="efficiency" name="efficiency" stroke="var(--color-efficiency)" strokeWidth={2} />
                  </LineChart>
                </ChartContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Efficacité opérationnelle (en pourcentage) calculée d'après le temps de travail productif.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Statistiques clés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary/50 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">Heures totales</div>
              <div className="text-2xl font-bold">{equipment.usage.hours}</div>
            </div>
            <div className="bg-secondary/50 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">Efficacité moyenne</div>
              <div className="text-2xl font-bold">90%</div>
            </div>
            <div className="bg-secondary/50 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">Coût maintenance</div>
              <div className="text-2xl font-bold">2,425€</div>
            </div>
            <div className="bg-secondary/50 p-4 rounded-md">
              <div className="text-sm text-muted-foreground">Carburant total</div>
              <div className="text-2xl font-bold">3,400L</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentPerformance;
