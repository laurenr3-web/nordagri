
import React, { useState } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import SettingsTabs from '@/components/settings/SettingsTabs';
import { useAuthContext } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

/**
 * Page des paramètres de l'application
 * Affiche différentes sections de configuration pour l'utilisateur
 */
const Settings = () => {
  const { isAuthenticated, loading } = useAuthContext();
  const [activeTab, setActiveTab] = useState('essentials');

  // Afficher un indicateur de chargement pendant la vérification de l'authentification
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Chargement des paramètres...</span>
        </div>
      </MainLayout>
    );
  }

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8">
          <div className="text-center p-8 bg-muted/30 rounded-lg border border-muted">
            <h2 className="text-xl font-semibold mb-4">Accès restreint</h2>
            <p className="mb-4">Veuillez vous connecter pour accéder aux paramètres de votre compte.</p>
            <a href="/auth" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90">
              Se connecter
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <h1 className="text-2xl font-semibold mb-4 mt-2 sm:mb-6 text-center sm:text-left">Paramètres</h1>
        <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </MainLayout>
  );
};

export default Settings;
