import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, FileText } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, getISOWeek, startOfWeek, isEven } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CalendarView from './CalendarView';
import ReportModal from './ReportModal';
import { useDailyHours } from '@/hooks/time-tracking/useDailyHours';
import { useMonthlySummary } from '@/hooks/time-tracking/useMonthlySummary';
import { useTaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';
import { useTopEquipment } from '@/hooks/time-tracking/useTopEquipment';
import { TimeDistributionChart } from './TimeDistributionChart';
import { TopEquipmentList } from './TopEquipmentList';
import { useExportReport } from '@/hooks/time-tracking/useExportReport';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

const TimeTrackingRapport: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [payPeriodStats, setPayPeriodStats] = useState({
    monthly: 0,
    biWeekly: 0,
  });
  const [isLoadingPayPeriod, setIsLoadingPayPeriod] = useState(true);
  
  const { isLoading: isSummaryLoading, summary } = useMonthlySummary();
  const { isLoading: isDailyHoursLoading, dailyHours } = useDailyHours(currentMonth);
  const { isLoading: isDistributionLoading, distribution } = useTaskTypeDistribution(currentMonth);
  const { isLoading: isEquipmentLoading, equipment } = useTopEquipment(currentMonth);
  const { exportToPdf, exportToExcel, isExporting } = useExportReport(currentMonth);
  
  // Helper function to calculate bi-weekly start date (last even Monday)
  const getLastEvenMondayStart = () => {
    const today = new Date();
    // Start from beginning of current week (Monday)
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    // Get current week number
    const currentWeekNumber = getISOWeek(today);
    
    // If current week is even, use it as start date
    if (isEven(currentWeekNumber)) {
      return thisWeekStart;
    }
    
    // Otherwise, go back one week to the most recent even week
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    return lastWeekStart;
  };
  
  // Fetch pay period statistics
  useEffect(() => {
    const fetchPayPeriodStats = async () => {
      setIsLoadingPayPeriod(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;
        
        const userId = sessionData.session.user.id;
        
        // Monthly calculation - from start to end of current month
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());
        
        // Bi-weekly calculation - from last even Monday to now
        const biWeeklyStart = getLastEvenMondayStart();
        
        // Run queries for monthly and bi-weekly totals
        const [monthlyResult, biWeeklyResult] = await Promise.all([
          supabase
            .from('time_sessions')
            .select('start_time, end_time, duration')
            .eq('user_id', userId)
            .gte('start_time', monthStart.toISOString())
            .lte('start_time', monthEnd.toISOString())
            .not('end_time', 'is', null),
            
          supabase
            .from('time_sessions')
            .select('start_time, end_time, duration')
            .eq('user_id', userId)
            .gte('start_time', biWeeklyStart.toISOString())
            .not('end_time', 'is', null)
        ]);
        
        // Calculate total hours for monthly period
        let monthlyHours = 0;
        if (monthlyResult.data) {
          monthlyHours = monthlyResult.data.reduce((total, session) => {
            // Use stored duration if available
            if (session.duration) {
              return total + session.duration;
            }
            
            // Otherwise calculate it
            if (session.start_time && session.end_time) {
              const start = new Date(session.start_time);
              const end = new Date(session.end_time);
              return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            }
            return total;
          }, 0);
        }
        
        // Calculate total hours for bi-weekly period
        let biWeeklyHours = 0;
        if (biWeeklyResult.data) {
          biWeeklyHours = biWeeklyResult.data.reduce((total, session) => {
            // Use stored duration if available
            if (session.duration) {
              return total + session.duration;
            }
            
            // Otherwise calculate it
            if (session.start_time && session.end_time) {
              const start = new Date(session.start_time);
              const end = new Date(session.end_time);
              return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            }
            return total;
          }, 0);
        }
        
        setPayPeriodStats({
          monthly: monthlyHours,
          biWeekly: biWeeklyHours
        });
      } catch (error) {
        console.error('Error calculating pay period stats:', error);
      } finally {
        setIsLoadingPayPeriod(false);
      }
    };
    
    fetchPayPeriodStats();
  }, []);

  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const closeModal = () => {
    setSelectedDate(null);
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    if (type === 'pdf') {
      await exportToPdf();
    } else {
      await exportToExcel();
    }
  };

  return (
    <div className="flex flex-col space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">NordAgri</h2>
            <p className="text-sm text-muted-foreground">Plateforme de gestion agricole</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1" 
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Exporter</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport('excel')}
              disabled={isExporting}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
          <Button variant="ghost" size="sm" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="font-medium">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Hours Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-blue-50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Aujourd'hui</p>
            <h3 className="text-xl font-bold">{summary?.today.toFixed(1)} h</h3>
            <Progress value={summary?.todayPercentage || 0} className="h-1 mt-1" />
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Cette semaine</p>
            <h3 className="text-xl font-bold">{summary?.week.toFixed(1)} h</h3>
            <Progress value={summary?.weekPercentage || 0} className="h-1 mt-1" />
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Ce mois</p>
            <h3 className="text-xl font-bold">{summary?.month.toFixed(1)} h</h3>
            <Progress value={summary?.monthPercentage || 0} className="h-1 mt-1" />
          </CardContent>
        </Card>
      </div>
      
      {/* Calendar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Calendrier d'activité</CardTitle>
          <CardDescription>Vue mensuelle avec total d'heures</CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarView 
            month={currentMonth}
            dailyHours={dailyHours}
            onDateClick={handleDateClick}
            isLoading={isDailyHoursLoading}
          />
        </CardContent>
      </Card>
      
      {/* Task Type Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Répartition par type de tâche</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeDistributionChart data={distribution} isLoading={isDistributionLoading} />
        </CardContent>
      </Card>
      
      {/* Top Equipment */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Équipements les plus utilisés</CardTitle>
        </CardHeader>
        <CardContent>
          <TopEquipmentList data={equipment} isLoading={isEquipmentLoading} />
        </CardContent>
      </Card>
      
      {/* Pay Period Summary - Updated implementation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Période de paie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Mensuelle</p>
              {isLoadingPayPeriod ? (
                <p className="text-lg font-medium">Chargement...</p>
              ) : (
                <p className="text-lg font-medium">{payPeriodStats.monthly.toFixed(1)} heures</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bi-hebdomadaire</p>
              {isLoadingPayPeriod ? (
                <p className="text-lg font-medium">Chargement...</p>
              ) : (
                <p className="text-lg font-medium">{payPeriodStats.biWeekly.toFixed(1)} heures</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal for day details */}
      {selectedDate && (
        <ReportModal 
          date={selectedDate}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default TimeTrackingRapport;
