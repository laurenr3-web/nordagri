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
      <Header isExporting={isExporting} onExport={handleExport} />
      {/* Month Selector */}
      <MonthSelector currentMonth={currentMonth} onPrevious={handlePreviousMonth} onNext={handleNextMonth} />
      {/* Hours Summary */}
      <HoursSummary summary={summary} />
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
