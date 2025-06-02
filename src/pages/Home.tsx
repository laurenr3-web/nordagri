
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { DomainDiagnostic } from '@/components/diagnostic/DomainDiagnostic';
import { productionConfig } from '@/config/productionConfig';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated' | 'error'>('checking');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      console.log(`🏠 Initialisation de la page d'accueil pour ${productionConfig.currentDomain}`);
      
      try {
        // Vérifier la connexion Supabase d'abord
        const isConnected = await checkSupabaseConnection();
        setConnectionStatus(isConnected ? 'connected' : 'disconnected');
        
        if (!isConnected) {
          setAuthStatus('error');
          setLoading(false);
          console.warn('❌ Connexion Supabase échouée');
          return;
        }

        // Vérifier l'authentification
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur auth:', error);
          setAuthStatus('error');
        } else if (session) {
          console.log('✅ Utilisateur authentifié');
          setAuthStatus('authenticated');
        } else {
          console.log('ℹ️ Utilisateur non authentifié');
          setAuthStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        setAuthStatus('error');
        setConnectionStatus('disconnected');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  const handleNavigation = (path: string) => {
    console.log(`🔄 Navigation vers ${path}`);
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Chargement d'OptiTractor...</p>
          {productionConfig.currentDomain === 'nordagri.ca' && (
            <p className="text-sm text-muted-foreground">Configuration nordagri.ca</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto pt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">OptiTractor</h1>
          <p className="text-xl text-gray-600 mb-2">Système de gestion d'équipement agricole</p>
          {productionConfig.currentDomain === 'nordagri.ca' && (
            <p className="text-sm text-primary font-medium">Version nordagri.ca</p>
          )}
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              {connectionStatus === 'connected' ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              )}
              <h3 className="font-semibold">État de la connexion</h3>
            </div>
            <p className={`text-sm ${connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
              {connectionStatus === 'connected' ? 'Connecté au serveur' : 'Problème de connexion'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              {authStatus === 'authenticated' ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : authStatus === 'unauthenticated' ? (
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              )}
              <h3 className="font-semibold">État de l'authentification</h3>
            </div>
            <p className={`text-sm ${
              authStatus === 'authenticated' ? 'text-green-600' :
              authStatus === 'unauthenticated' ? 'text-orange-600' : 'text-red-600'
            }`}>
              {authStatus === 'authenticated' && 'Connecté'}
              {authStatus === 'unauthenticated' && 'Non connecté'}
              {authStatus === 'error' && 'Erreur d\'authentification'}
            </p>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4 mb-8">
          {authStatus === 'authenticated' && (
            <Button 
              onClick={() => handleNavigation('/dashboard')}
              size="lg"
              className="w-full max-w-md"
            >
              Accéder au tableau de bord
            </Button>
          )}
          
          {authStatus === 'unauthenticated' && connectionStatus === 'connected' && (
            <Button 
              onClick={() => handleNavigation('/auth')}
              size="lg"
              className="w-full max-w-md"
            >
              Se connecter
            </Button>
          )}

          {(authStatus === 'error' || connectionStatus === 'disconnected') && (
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                size="lg"
                className="w-full max-w-md"
              >
                Recharger la page
              </Button>
              <Button 
                onClick={() => setShowDiagnostic(!showDiagnostic)}
                variant="outline"
                size="sm"
              >
                {showDiagnostic ? 'Masquer' : 'Afficher'} le diagnostic
              </Button>
            </div>
          )}
        </div>

        {/* Diagnostic */}
        {showDiagnostic && (
          <div className="mb-8">
            <DomainDiagnostic />
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2025 OptiTractor - Gestion d'équipement agricole</p>
          <p className="mt-1">Domaine: {productionConfig.currentDomain}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
