
import React, { useState } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionSectionProps {
  onManageSubscription: () => Promise<boolean>;
}

export function SubscriptionSection({ onManageSubscription }: SubscriptionSectionProps) {
  const [loading, setLoading] = useState(false);
  const { subscription, loading: subscriptionLoading } = useSubscription();

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      await onManageSubscription();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <SettingsSection 
      title="Abonnement" 
      description="Gérez votre abonnement et vos informations de facturation"
      icon={<CreditCard className="h-5 w-5" />}
    >
      <div className="space-y-4">
        {subscriptionLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Chargement des informations d'abonnement...</span>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 pb-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg">Plan actuel</h3>
                    <p className="text-sm text-muted-foreground">
                      {subscription?.plan || 'Gratuit'}
                    </p>
                  </div>
                  {subscription?.active ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Actif</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Inactif</span>
                    </div>
                  )}
                </div>
                
                {subscription?.current_period_end && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {subscription?.cancel_at_period_end 
                        ? `L'abonnement se termine le ${formatDate(subscription.current_period_end)}`
                        : `Prochain renouvellement le ${formatDate(subscription.current_period_end)}`
                      }
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Gérer mon abonnement
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SettingsSection>
  );
}
