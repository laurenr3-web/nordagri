
import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Grid } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { TimeBreakdownChart } from './TimeBreakdownChart';
import { useTimeBreakdown } from '@/hooks/time-tracking/useTimeBreakdown';
import { Button } from '@/components/ui/button';
import { useTaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';
import { TopEquipmentList } from './TopEquipmentList';
import { TimeDistributionChart } from './TimeDistributionChart';
import { toast } from 'sonner';
import ReportModal from './ReportModal';

const TimeTrackingRapport: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Charger les données pour la répartition par type de tâche
  const { distribution, isLoading: isDistributionLoading, error: distributionError } = 
    useTaskTypeDistribution(selectedMonth);
  
  // Utiliser également useTimeBreakdown pour afficher plusieurs visualisations
  const { data: timeBreakdownData, isLoading: isBreakdownLoading, error: breakdownError } =
    useTimeBreakdown();
  
  const handleGenerateReport = () => {
    toast.info('Génération du rapport en cours...');
    setIsReportModalOpen(true);
  };
  
  const handleMonthSelect = (date: Date | Date[] | undefined) => {
    // Handle only single date selection
    if (date instanceof Date) {
      setSelectedMonth(date);
    }
  };
  
  // Ensure all distribution items have a color
  const distributionWithColors = distribution.map(item => ({
    ...item,
    color: item.color || '#999999' // Provide default color if missing
  }));
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rapport d'activité</h2>
          <p className="text-muted-foreground">
            Visualisez la répartition de votre temps de travail
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <DatePicker
            mode="single"
            selected={selectedMonth}
            onSelect={handleMonthSelect}
            showMonthYearPicker
            dateFormat="MMMM yyyy"
            locale={fr}
            captionLayout="dropdown-buttons"
          />
          
          <Button onClick={handleGenerateReport}>
            <Grid className="h-4 w-4 mr-2" />
            Générer un rapport
          </Button>
        </div>
      </div>
      
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Heures enregistrées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isDistributionLoading ? (
                "Chargement..."
              ) : (
                `${distribution.reduce((sum, item) => sum + item.hours, 0).toFixed(1)}h`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              En {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isDistributionLoading ? "Chargement..." : distribution.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Types de tâches différents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Type principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isDistributionLoading ? (
                "Chargement..."
              ) : distribution.length > 0 ? (
                distribution.sort((a, b) => b.hours - a.hours)[0].type
              ) : (
                "Aucune donnée"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Le plus d'heures enregistrées
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Moyenne quotidienne</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isDistributionLoading ? (
                "Chargement..."
              ) : distribution.length > 0 ? (
                `${(distribution.reduce((sum, item) => sum + item.hours, 0) / 22).toFixed(1)}h`
              ) : (
                "0h"
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Basé sur 22 jours ouvrables
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeDistributionChart 
          data={distributionWithColors}
          isLoading={isDistributionLoading}
          error={distributionError}
          title={`Répartition par type de tâche (${format(selectedMonth, 'MMMM yyyy', { locale: fr })})`}
        />
        
        <TimeBreakdownChart 
          data={timeBreakdownData}
          isLoading={isBreakdownLoading}
          error={breakdownError}
        />
      </div>
      
      {/* Top des équipements */}
      <TopEquipmentList month={selectedMonth} />
      
      {/* Modal de rapport */}
      <ReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        month={selectedMonth}
        statistics={{
          totalHours: distribution.reduce((sum, item) => sum + item.hours, 0),
          taskCount: distribution.length,
          mainTask: distribution.length > 0 ? distribution.sort((a, b) => b.hours - a.hours)[0].type : "Aucune",
          dailyAverage: distribution.length > 0 ? distribution.reduce((sum, item) => sum + item.hours, 0) / 22 : 0
        }}
        taskDistribution={distributionWithColors}
      />
    </div>
  );
};

export default TimeTrackingRapport;
