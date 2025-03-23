
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OptiFieldMap from '@/components/optifield/OptiFieldMap';
import OptiFieldTimeline from '@/components/optifield/OptiFieldTimeline';
import OptiFieldHeader from '@/components/optifield/OptiFieldHeader';
import OptiFieldSummary from '@/components/optifield/OptiFieldSummary';
import OptiFieldChatInterface from '@/components/optifield/OptiFieldChatInterface';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, RefreshCw, KeyRound, MapPin, BarChart2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMapService } from '@/services/optiField/mapService';

const OptiField = () => {
  const [selectedView, setSelectedView] = useState<string>("map");
  const [trackingActive, setTrackingActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('AIzaSyDYNpssW98FUa34qBKCD6JdI7iWYnzFxyI'); // Clé pré-remplie
  
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
  
  // Initialiser automatiquement la clé API
  useEffect(() => {
    if (!mapApiKey && !isLoading) {
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
  
  const tabIcons = {
    map: <MapPin className="h-4 w-4 mr-2" />,
    summary: <BarChart2 className="h-4 w-4 mr-2" />,
    timeline: <Clock className="h-4 w-4 mr-2" />
  };
  
  // État de chargement
  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-lg font-medium">Chargement d'OptiField...</p>
            <p className="text-sm text-muted-foreground">Préparation de vos données agricoles</p>
          </div>
        </div>
      </div>
    );
  }
  
  // État d'erreur
  if (isError) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 md:ml-64 flex items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center gap-6 max-w-md">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <Alert variant="destructive" className="mb-2">
              <AlertTitle className="text-lg">Erreur de configuration</AlertTitle>
              <AlertDescription>
                Nous avons besoin d'une clé API Google Maps valide pour afficher vos champs et équipements. Veuillez configurer votre clé API pour continuer.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button 
                onClick={() => setIsApiKeyDialogOpen(true)} 
                className="px-4 py-2 bg-primary text-primary-foreground gap-2 flex items-center justify-center w-full sm:w-auto"
              >
                <KeyRound className="h-4 w-4" />
                Configurer la clé API
              </Button>
              <Button 
                onClick={handleReload} 
                variant="outline" 
                className="px-4 py-2 gap-2 flex items-center justify-center w-full sm:w-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Recharger la page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // État normal - tout est chargé et fonctionnel
  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      
      <main className="flex-1 md:ml-64">
        <div className="container py-10 md:py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <OptiFieldHeader trackingActive={trackingActive} setTrackingActive={setTrackingActive} />
          
          <div className="my-8">
            <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                {Object.entries(tabIcons).map(([key, icon]) => (
                  <TabsTrigger key={key} value={key} className="flex items-center">
                    {icon}
                    <span>{key === 'map' ? 'Carte' : key === 'summary' ? 'Analyses' : 'Historique'}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="relative rounded-lg border bg-card">
                <TabsContent value="map" className="relative mt-0 p-0">
                  <OptiFieldMap trackingActive={trackingActive} />
                </TabsContent>
                
                <TabsContent value="summary" className="p-4 md:p-6">
                  <OptiFieldSummary />
                </TabsContent>
                
                <TabsContent value="timeline" className="p-4 md:p-6">
                  <OptiFieldTimeline />
                </TabsContent>
              </div>
            </Tabs>
          </div>
          
          <div className="mt-8">
            <OptiFieldChatInterface trackingActive={trackingActive} setTrackingActive={setTrackingActive} />
          </div>
        </div>
      </main>
      
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurer la clé API Google Maps</DialogTitle>
            <DialogDescription>
              Cette clé est nécessaire pour afficher les cartes et géolocaliser vos équipements.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Clé API Google Maps</Label>
                <Input 
                  id="api-key" 
                  placeholder="Entrez votre clé API Google Maps" 
                  value={apiKeyInput} 
                  onChange={e => setApiKeyInput(e.target.value)} 
                  className="font-mono text-sm"
                  autoComplete="off"
                />
              </div>
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
                <AlertDescription className="text-sm text-muted-foreground">
                  Vous pouvez obtenir une clé API dans la <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Console Google Cloud</a>.
                  Activez les API Maps JavaScript et Geocoding.
                </AlertDescription>
              </Alert>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveApiKey} disabled={!apiKeyInput.trim()}>
              Enregistrer et appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OptiField;
