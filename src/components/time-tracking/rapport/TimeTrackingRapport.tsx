
import React, { useState, useEffect } from 'react';
import RapportContainer from './RapportContainer';
import CalendarView from './CalendarView';
import ReportModal from './ReportModal';
import { useDailyHours } from '@/hooks/time-tracking/useDailyHours';
import { useMonthlySummary } from '@/hooks/time-tracking/useMonthlySummary';
import { useTaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';
import { useTopEquipment } from '@/hooks/time-tracking/useTopEquipment';
import RapportGraphs from './RapportGraphs';
import RapportPayPeriod from './RapportPayPeriod';
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
  
  const getLastEvenMondayStart = () => {
    const today = new Date();
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const currentWeekNumber = getISOWeek(today);
    if (isEven(currentWeekNumber)) {
      return thisWeekStart;
    }
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    return lastWeekStart;
  };
  
  useEffect(() => {
    const fetchPayPeriodStats = async () => {
      setIsLoadingPayPeriod(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) return;
        const userId = sessionData.session.user.id;
        const monthStart = startOfMonth(new Date());
        const monthEnd = endOfMonth(new Date());
        const biWeeklyStart = getLastEvenMondayStart();
        const [monthlyResult, biWeeklyResult] = await Promise.all([
          supabase.from('time_sessions').select('start_time, end_time, duration')
            .eq('user_id', userId)
            .gte('start_time', monthStart.toISOString())
            .lte('start_time', monthEnd.toISOString())
            .not('end_time', 'is', null),
          supabase.from('time_sessions').select('start_time, end_time, duration')
            .eq('user_id', userId)
            .gte('start_time', biWeeklyStart.toISOString())
            .not('end_time', 'is', null)
        ]);
        let monthlyHours = 0;
        if (monthlyResult.data) {
          monthlyHours = monthlyResult.data.reduce((total, session) => {
            if (session.duration) {
              return total + session.duration;
            }
            if (session.start_time && session.end_time) {
              const start = new Date(session.start_time);
              const end = new Date(session.end_time);
              return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            }
            return total;
          }, 0);
        }
        let biWeeklyHours = 0;
        if (biWeeklyResult.data) {
          biWeeklyHours = biWeeklyResult.data.reduce((total, session) => {
            if (session.duration) {
              return total + session.duration;
            }
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
    <RapportContainer>
      {/* Header */}
      <Header isExporting={isExporting} onExport={handleExport} />
      {/* Month Selector */}
      <div className="mt-2 mb-2">
        <MonthSelector currentMonth={currentMonth} onPrevious={handlePreviousMonth} onNext={handleNextMonth} />
      </div>
      {/* Hours Summary */}
      <div className="w-full">
        <HoursSummary summary={summary} />
      </div>
      {/* Calendar */}
      <div className="mt-4">
        <CalendarView 
          month={currentMonth}
          dailyHours={dailyHours}
          onDateClick={handleDateClick}
          isLoading={isDailyHoursLoading}
        />
      </div>
      {/* Task Distribution + Equipment */}
      <RapportGraphs 
        distribution={distribution}
        isDistributionLoading={isDistributionLoading}
        equipment={equipment}
        isEquipmentLoading={isEquipmentLoading}
      />
      {/* Pay Period Summary */}
      <RapportPayPeriod 
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
    </RapportContainer>
  );
};
export default TimeTrackingRapport;
