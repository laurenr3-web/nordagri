
import React, { useState, useEffect, useMemo } from 'react';
import { usePartsWithdrawal } from '@/hooks/parts/usePartsWithdrawal';
import { WithdrawalRecord } from '@/hooks/parts/withdrawal/types';
import { Part } from '@/types/Part';
import { toast } from 'sonner';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import HistoryList from './HistoryList';

interface ContentWrapperProps {
  part: Part;
}

const ContentWrapper: React.FC<ContentWrapperProps> = ({ part }) => {
  const { getWithdrawalHistory, formatWithdrawalReason } = usePartsWithdrawal();
  const [history, setHistory] = useState<WithdrawalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Extract part ID once to stabilize it and prevent re-renders
  const partId = useMemo(() => {
    if (!part || !part.id) return null;
    return typeof part.id === 'string' ? parseInt(part.id, 10) : part.id;
  }, [part]);

  useEffect(() => {
    // Skip the effect entirely if partId is invalid
    if (!partId) {
      setError('Détails de pièce non disponibles');
      setIsLoading(false);
      return;
    }
    
    let isMounted = true; // For cleanup
    
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching withdrawal history for part ID:', partId);
        
        // Validate part ID before proceeding
        if (isNaN(partId) || partId <= 0) {
          console.error('Invalid part ID:', partId);
          if (isMounted) {
            setError('ID de pièce invalide');
            setHistory([]);
          }
          return;
        }
        
        try {
          // Get withdrawal history with error handling
          const data = await getWithdrawalHistory(partId);
          console.log('Withdrawal history data received:', data);
          
          if (isMounted) {
            if (!data) {
              console.warn('No withdrawal history data returned');
              setHistory([]);
            } else {
              // Ensure we have an array
              setHistory(Array.isArray(data) ? data : []);
            }
          }
        } catch (fetchError: any) {
          console.error('Error in getWithdrawalHistory:', fetchError);
          if (isMounted) {
            setError(`Erreur lors du chargement: ${fetchError.message || 'Erreur inconnue'}`);
            setHistory([]);
          }
        }
      } catch (err: any) {
        console.error('General error in WithdrawalHistory effect:', err);
        if (isMounted) {
          setError('Erreur lors du chargement de l\'historique');
          setHistory([]);
          toast.error("Erreur lors du chargement de l'historique des retraits");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHistory();
    
    return () => {
      isMounted = false; // Prevent state updates after unmount
    };
  }, [partId, getWithdrawalHistory]); // Only re-run when partId or getWithdrawalHistory change

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} />;
  }

  // Empty state
  if (history.length === 0) {
    return <EmptyState />;
  }

  // Data state
  return (
    <HistoryList 
      history={history}
      part={part}
      formatWithdrawalReason={formatWithdrawalReason}
    />
  );
};

export default ContentWrapper;
