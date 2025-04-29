import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';

type Props = {
  isLoading: boolean;
  monthly: number;
  biWeekly: number;
};

const PayPeriodSummary: React.FC<Props> = ({ isLoading, monthly, biWeekly }) => {
  // State for custom period mode
  const [showCustomPeriod, setShowCustomPeriod] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [customPeriodHours, setCustomPeriodHours] = useState<number | null>(null);
  const [isLoadingCustomPeriod, setIsLoadingCustomPeriod] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch custom period hours when date range changes
  useEffect(() => {
    const fetchCustomPeriodHours = async () => {
      // Reset state
      setCustomPeriodHours(null);
      setErrorMessage('');

      // Only proceed if we have both start and end date
      if (!dateRange?.from || !dateRange?.to) {
        return;
      }

      // Validate date range
      if (dateRange.to < dateRange.from) {
        setErrorMessage('La date de fin doit être postérieure à la date de début');
        return;
      }

      try {
        setIsLoadingCustomPeriod(true);
        
        // Get current user
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          setErrorMessage('Utilisateur non connecté');
          return;
        }
        
        const userId = sessionData.session.user.id;
        
        // Set end of day for the end date to include the entire day
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59);
        
        // Query time sessions for the selected date range
        const { data: timeEntries, error } = await supabase
          .from('time_sessions')
          .select('start_time, end_time, duration')
          .eq('user_id', userId)
          .gte('start_time', dateRange.from.toISOString())
          .lte('start_time', endDate.toISOString())
          .not('end_time', 'is', null);
        
        if (error) {
          console.error('Error fetching custom period data:', error);
          setErrorMessage('Impossible de récupérer les données pour cette période');
          return;
        }
        
        // Calculate total hours for the period
        let totalHours = 0;
        if (timeEntries) {
          totalHours = timeEntries.reduce((total, session) => {
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
        
        setCustomPeriodHours(totalHours);
      } catch (error) {
        console.error('Error calculating custom period hours:', error);
        setErrorMessage('Une erreur est survenue lors du calcul des heures');
      } finally {
        setIsLoadingCustomPeriod(false);
      }
    };
    
    if (showCustomPeriod && dateRange?.from && dateRange?.to) {
      fetchCustomPeriodHours();
    }
  }, [dateRange, showCustomPeriod]);

  // Format date range for display
  const formattedDateRange = () => {
    if (!dateRange?.from || !dateRange?.to) return '';
    
    return `du ${format(dateRange.from, 'dd MMMM yyyy', { locale: fr })} au ${format(dateRange.to, 'dd MMMM yyyy', { locale: fr })}`;
  };

  // Toggle custom period mode
  const toggleCustomPeriod = () => {
    setShowCustomPeriod(!showCustomPeriod);
    if (!showCustomPeriod) {
      // Initialize with current date and week ahead when enabling custom mode
      const today = new Date();
      const weekLater = new Date();
      weekLater.setDate(today.getDate() + 7);
      
      setDateRange({
        from: today,
        to: weekLater
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Période de paie</CardTitle>
          <Button 
            variant={showCustomPeriod ? "default" : "outline"} 
            size="sm"
            onClick={toggleCustomPeriod}
            className="flex items-center gap-1 text-xs"
          >
            <Calendar className="h-3 w-3" />
            {showCustomPeriod ? "Standard" : "Personnalisé"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showCustomPeriod ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Sélectionnez une période personnalisée</p>
            
            <div className="w-full">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
            
            {!errorMessage && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Total {formattedDateRange()}
                </p>
                {isLoadingCustomPeriod ? (
                  <p className="text-lg font-medium">Calcul en cours...</p>
                ) : (
                  customPeriodHours !== null && (
                    <p className="text-lg font-medium">{customPeriodHours.toFixed(1)} heures</p>
                  )
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Mensuelle</p>
              {isLoading ? (
                <p className="text-lg font-medium">Chargement...</p>
              ) : (
                <p className="text-lg font-medium">{monthly.toFixed(1)} heures</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bi-hebdomadaire</p>
              {isLoading ? (
                <p className="text-lg font-medium">Chargement...</p>
              ) : (
                <p className="text-lg font-medium">{biWeekly.toFixed(1)} heures</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayPeriodSummary;
