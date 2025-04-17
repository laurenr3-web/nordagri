
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { addDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTimeTrackingUser } from '@/hooks/time-tracking/useTimeTrackingUser';
import { usePayrollPeriod } from '@/hooks/time-tracking/usePayrollPeriod';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

type PeriodType = 'weekly' | 'biweekly' | 'triweekly' | 'monthly' | 'custom' | 'today';

interface PayrollPeriodProps {
  className?: string;
}

export function PayrollPeriod({ className }: PayrollPeriodProps) {
  const [periodType, setPeriodType] = useState<PeriodType>('weekly');
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: startOfDay(new Date()),
    to: endOfDay(addDays(new Date(), 7))
  });

  const { userId } = useTimeTrackingUser();
  const { totalHours, isLoading, error, refetch } = usePayrollPeriod(
    userId,
    dateRange.from,
    dateRange.to,
    periodType
  );

  const getPeriodDates = useCallback((type: PeriodType) => {
    const today = new Date();
    const start = startOfDay(today);
    
    switch (type) {
      case 'today':
        return { from: start, to: endOfDay(start) };
      case 'weekly':
        return { from: start, to: endOfDay(addDays(start, 7)) };
      case 'biweekly':
        return { from: start, to: endOfDay(addDays(start, 14)) };
      case 'triweekly':
        return { from: start, to: endOfDay(addDays(start, 21)) };
      case 'monthly':
        return { from: start, to: endOfDay(addDays(start, 30)) };
      case 'custom':
        return dateRange;
      default:
        return { from: start, to: endOfDay(addDays(start, 7)) };
    }
  }, [dateRange]);

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriodType(newPeriod);
    if (newPeriod !== 'custom') {
      const newDates = getPeriodDates(newPeriod);
      setDateRange(newDates);
    }
  };

  const handleCustomDateChange = (range: { from: Date; to: Date } | undefined) => {
    if (range?.from && range?.to) {
      setDateRange({
        from: startOfDay(range.from),
        to: endOfDay(range.to)
      });
    }
  };

  // Set initial period dates when component mounts
  useEffect(() => {
    const initialDates = getPeriodDates('weekly');
    setDateRange(initialDates);
  }, [getPeriodDates]);

  // Format total hours with one decimal place
  const formattedHours = Number(totalHours).toFixed(1);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex justify-between items-center">
          <span>Période de paie</span>
          <Select value={periodType} onValueChange={(value: PeriodType) => handlePeriodChange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner la période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="biweekly">Bi-hebdomadaire</SelectItem>
              <SelectItem value="triweekly">Toutes les 3 semaines</SelectItem>
              <SelectItem value="monthly">Mensuel</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {periodType === 'custom' && (
          <div className="mb-4">
            <DateRangePicker
              value={dateRange}
              onChange={handleCustomDateChange}
            />
          </div>
        )}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Heures totales</p>
            {error ? (
              <div className="flex items-center text-sm text-red-500 mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Erreur de chargement</span>
              </div>
            ) : isLoading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <p className="text-lg font-medium">{formattedHours} heures</p>
            )}
            {error && (
              <button 
                className="text-xs text-blue-500 mt-1 underline"
                onClick={() => refetch()}
              >
                Réessayer
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
