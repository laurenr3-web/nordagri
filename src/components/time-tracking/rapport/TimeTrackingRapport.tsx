
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import CalendarView from './CalendarView';
import ReportModal from './ReportModal';
import { useDailyHours } from '@/hooks/time-tracking/useDailyHours';
import { useMonthlySummary } from '@/hooks/time-tracking/useMonthlySummary';
import { useTaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';
import { useTopEquipment } from '@/hooks/time-tracking/useTopEquipment';
import { TimeDistributionChart } from './TimeDistributionChart';
import { TopEquipmentList } from './TopEquipmentList';
import { useExportReport } from '@/hooks/time-tracking/useExportReport';
import { 
  startOfMonth, 
  endOfMonth, 
  getISOWeek, 
  startOfWeek, 
  subMonths, 
  addMonths 
} from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { isEven } from '@/utils/dateHelpers';
import Header from './Header';
import MonthSelector from './MonthSelector';
import HoursSummary from './HoursSummary';
import PayPeriodSummary from './PayPeriodSummary';

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
        
        // Source unique : work_shifts (alignée avec le Calendrier d'activité,
        // useMonthlySummary, useTimeTrackingStats). Pas de double comptage avec time_sessions.
        const [monthlyResult, biWeeklyResult] = await Promise.all([
          supabase
            .from('work_shifts')
            .select('punch_in_at, punch_out_at')
            .eq('user_id', userId)
            .gte('punch_in_at', monthStart.toISOString())
            .lte('punch_in_at', monthEnd.toISOString()),

          supabase
            .from('work_shifts')
            .select('punch_in_at, punch_out_at')
            .eq('user_id', userId)
            .gte('punch_in_at', biWeeklyStart.toISOString())
        ]);

        const nowMs = Date.now();
        const sumShiftHours = (
          rows: Array<{ punch_in_at: string; punch_out_at: string | null }> | null
        ): number => {
          if (!rows) return 0;
          return rows.reduce((total, shift) => {
            const startMs = new Date(shift.punch_in_at).getTime();
            const endMs = shift.punch_out_at ? new Date(shift.punch_out_at).getTime() : nowMs;
            const hours = Math.max(0, (endMs - startMs) / (1000 * 60 * 60));
            return total + hours;
          }, 0);
        };

        const monthlyHours = sumShiftHours(monthlyResult.data);
        const biWeeklyHours = sumShiftHours(biWeeklyResult.data);
        
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
    <div className="flex flex-col space-y-5 sm:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <Header isExporting={isExporting} onExport={handleExport} />

      {/* Month Selector */}
      <MonthSelector
        currentMonth={currentMonth}
        onPrevious={handlePreviousMonth}
        onNext={handleNextMonth}
      />

      {/* KPI Hours Summary */}
      <HoursSummary summary={summary} />

      {/* Charts grid (desktop 2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Répartition par type de tâche</CardTitle>
            <CardDescription>Où va le temps ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeDistributionChart data={distribution} isLoading={isDistributionLoading} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Équipements les plus utilisés</CardTitle>
            <CardDescription>Top équipements suivis</CardDescription>
          </CardHeader>
          <CardContent>
            <TopEquipmentList data={equipment} isLoading={isEquipmentLoading} />
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card className="rounded-2xl">
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

      {/* Pay Period Summary */}
      <PayPeriodSummary 
        isLoading={isLoadingPayPeriod}
        monthly={payPeriodStats.monthly}
        biWeekly={payPeriodStats.biWeekly}
      />
      
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
