
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSimpleAuthContext } from '@/providers/SimpleAuthProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { productionConfig } from '@/config/productionConfig';

const Home: React.FC = () => {
  console.log('🏠 Rendering Home page...');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Utiliser le contexte d'authentification simplifié
  const { isAuthenticated, loading: authLoading, user } = useSimpleAuthContext();

  useEffect(() => {
    console.log(`🏠 Home mounted - Domain: ${productionConfig.currentDomain}`);
    console.log(`🔐 Auth status - Loading: ${authLoading}, Authenticated: ${isAuthenticated}`);
    
    // Attendre que l'authentification soit prête
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const handleNavigation = (path: string) => {
    console.log(`🔄 Navigation vers ${path}`);
    navigate(path);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Chargement d'OptiTractor...</p>
          <p className="text-sm text-muted-foreground">Domain: {productionConfig.currentDomain}</p>
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

        {/* Status Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            {isAuthenticated ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            )}
            <h3 className="font-semibold">État de l'authentification</h3>
          </div>
          <p className={`text-sm ${isAuthenticated ? 'text-green-600' : 'text-orange-600'}`}>
            {isAuthenticated ? `Connecté (${user?.email})` : 'Non connecté'}
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4 mb-8">
          {isAuthenticated ? (
            <Button 
              onClick={() => handleNavigation('/dashboard')}
              size="lg"
              className="w-full max-w-md"
            >
              Accéder au tableau de bord
            </Button>
          ) : (
            <Button 
              onClick={() => handleNavigation('/auth')}
              size="lg"
              className="w-full max-w-md"
            >
              Se connecter
            </Button>
          )}
        </div>

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
