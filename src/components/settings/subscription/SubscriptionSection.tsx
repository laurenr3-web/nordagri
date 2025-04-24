
import React, { useState, useEffect } from 'react';
import { SettingsSection } from '../SettingsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

/**
 * Composant pour la gestion des abonnements et facturation
 */
export function SubscriptionSection() {
  const { subscription, loading, refresh } = useSubscription();
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const handleUpgradeClick = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: "price_1OABCxyz123", interval: "month" }
      });
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Impossible de rediriger vers la page de paiement");
    }
  };
  
  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        body: {}
      });
      
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Impossible d'accéder au portail client");
    }
  };
  
  // Simuler le chargement de l'historique des paiements
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      setLoadingHistory(true);
      try {
        // Cette fonction est un placeholder - dans une implémentation réelle,
        // vous feriez un appel à un edge function pour récupérer ces données depuis Stripe
        setTimeout(() => {
          setPaymentHistory([
            {
              id: "pi_123456",
              date: new Date(2023, 10, 15),
              amount: 29.99,
              status: "succeeded"
            },
            {
              id: "pi_123455",
              date: new Date(2023, 9, 15),
              amount: 29.99,
              status: "succeeded"
            }
          ]);
          setLoadingHistory(false);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors du chargement de l'historique des paiements:", error);
        setLoadingHistory(false);
      }
    };
    
    if (subscription?.active) {
      fetchPaymentHistory();
    }
  }, [subscription]);
  
  const formatPlanType = (plan?: string) => {
    switch (plan) {
      case "pro": return "Pro";
      case "enterprise": return "Entreprise";
      default: return "Gratuit";
    }
  };
  
  const getPlanBadgeColor = (plan?: string) => {
    switch (plan) {
      case "pro": return "bg-blue-500 hover:bg-blue-600";
      case "enterprise": return "bg-purple-500 hover:bg-purple-600";
      default: return "bg-green-500 hover:bg-green-600";
    }
  };
  
  return (
    <SettingsSection 
      title="Abonnement et facturation" 
      description="Gérez votre abonnement et consultez vos factures"
    >
      <div className="space-y-8">
        {/* Plan actuel */}
        <div className="space-y-4">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Carte Plan Gratuit */}
            <Card className={`relative ${subscription?.plan === 'free' ? 'border-primary' : ''}`}>
              {subscription?.plan === 'free' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary hover:bg-primary">Votre plan</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>Gratuit</CardTitle>
                <CardDescription>Pour les petites exploitations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0€</p>
                <p className="text-sm text-muted-foreground">par mois</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Jusqu'à 10 équipements</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Maintenance basique</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Carte Plan Pro */}
            <Card className={`relative ${subscription?.plan === 'pro' ? 'border-primary' : ''}`}>
              {subscription?.plan === 'pro' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary hover:bg-primary">Votre plan</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Pour les exploitations moyennes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">29,99€</p>
                <p className="text-sm text-muted-foreground">par mois</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Jusqu'à 50 équipements</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Maintenance avancée</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Module statistiques</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Carte Plan Enterprise */}
            <Card className={`relative ${subscription?.plan === 'enterprise' ? 'border-primary' : ''}`}>
              {subscription?.plan === 'enterprise' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary hover:bg-primary">Votre plan</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Pour les grandes exploitations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">99,99€</p>
                <p className="text-sm text-muted-foreground">par mois</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Équipements illimités</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Tous les modules</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Support prioritaire</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          {/* Statut de l'abonnement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Votre abonnement</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[200px]" />
                  <Skeleton className="h-4 w-[300px]" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getPlanBadgeColor(subscription?.plan)}>
                      {formatPlanType(subscription?.plan)}
                    </Badge>
                    {subscription?.active && (
                      <Badge variant="outline" className="ml-2 bg-green-50">
                        <CheckCircle className="h-3 w-3 mr-1" /> Actif
                      </Badge>
                    )}
                    {subscription?.status === 'past_due' && (
                      <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-800">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Paiement en retard
                      </Badge>
                    )}
                  </div>
                  
                  {subscription?.current_period_end && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Renouvellement prévu le {format(new Date(subscription.current_period_end), 'd MMMM yyyy', { locale: fr })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between flex-wrap gap-2">
              <Button 
                onClick={handleUpgradeClick} 
                disabled={loading || (subscription?.plan === 'enterprise')}
              >
                Mettre à niveau <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              {subscription?.active && (
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  disabled={loading}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Gérer l'abonnement
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Historique des paiements */}
          {subscription?.active && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique des paiements</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : paymentHistory.length > 0 ? (
                  <div className="border rounded-md">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentHistory.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{format(payment.date, 'd MMMM yyyy', { locale: fr })}</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{payment.amount} €</td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                              {payment.status === 'succeeded' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Payé
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Échoué
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Aucun historique de paiement disponible</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SettingsSection>
  );
}
