
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';
import { useMapService } from '@/services/optiField/mapService';

// Import smaller component files
import LoadingState from '@/components/optifield/states/LoadingState';
import ErrorState from '@/components/optifield/states/ErrorState';
import ApiKeyDialog from '@/components/optifield/dialogs/ApiKeyDialog';
import OptiFieldContent from '@/components/optifield/OptiFieldContent';

const OptiField = () => {
  const [trackingActive, setTrackingActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('AIzaSyDYNpssW98FUa34qBKCD6JdI7iWYnzFxyI'); // Clé API pré-remplie
  
  const {
    isError,
    mapApiKey,
    setAndSaveMapApiKey
  } = useMapService();
  
  const handleReload = () => {
    toast.loading('Rechargement en cours...');
    window.location.reload();
  };
  
  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      toast.loading('Enregistrement de la clé API...');
      setAndSaveMapApiKey(apiKeyInput.trim());
      setIsApiKeyDialogOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      toast.error('Veuillez entrer une clé API valide');
    }
  };
  
  // Initialiser la clé API au montage du composant si elle n'est pas déjà définie
  useEffect(() => {
    if (!mapApiKey && !isLoading) {
      // Utiliser la clé Google Maps fournie
      setAndSaveMapApiKey('AIzaSyDYNpssW98FUa34qBKCD6JdI7iWYnzFxyI');
      toast.success('Clé API Google Maps configurée automatiquement');
    }
  }, [mapApiKey, isLoading, setAndSaveMapApiKey]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!isError && !isLoading) {
      toast.success('OptiField chargé avec succès', {
        description: 'Toutes les fonctionnalités sont prêtes à être utilisées',
        duration: 3000,
      });
    }
  }, [isError, isLoading]);
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (isError) {
    return (
      <ErrorState 
        onConfigureApiKey={() => setIsApiKeyDialogOpen(true)} 
        onReload={handleReload} 
      />
    );
  }
  
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      
      <main className="flex-1 md:ml-64">
        <OptiFieldContent 
          trackingActive={trackingActive} 
          setTrackingActive={setTrackingActive} 
        />
      </main>
      
      <ApiKeyDialog 
        isOpen={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
        apiKeyInput={apiKeyInput}
        setApiKeyInput={setApiKeyInput}
        onSave={handleSaveApiKey}
      />
    </div>
  );
};

export default OptiField;
