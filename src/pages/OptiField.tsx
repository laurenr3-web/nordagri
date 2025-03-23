
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OptiFieldMap from '@/components/optifield/OptiFieldMap';
import OptiFieldTimeline from '@/components/optifield/OptiFieldTimeline';
import OptiFieldHeader from '@/components/optifield/OptiFieldHeader';
import OptiFieldSummary from '@/components/optifield/OptiFieldSummary';
import OptiFieldChatInterface from '@/components/optifield/OptiFieldChatInterface';
import Navbar from '@/components/layout/Navbar';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, RefreshCw, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMapService } from '@/services/optiField/mapService';

const OptiField = () => {
  const [selectedView, setSelectedView] = useState<string>("map");
  const [trackingActive, setTrackingActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const { isError, mapApiKey, setAndSaveMapApiKey } = useMapService();
  
  const handleReload = () => {
    window.location.reload();
  };
  
  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setAndSaveMapApiKey(apiKeyInput.trim());
      setIsApiKeyDialogOpen(false);
      // Small delay before reloading to allow state to update
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      toast.error('Please enter a valid API key');
    }
  };
  
  useEffect(() => {
    // Simulate loading to ensure components have time to initialize
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Show toast when component is mounted
    if (!isError) {
      toast.success('OptiField chargé avec succès');
    }
  }, [isError]);
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-lg font-medium">Chargement d'OptiField...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex min-h-screen">
        <Navbar />
        <div className="flex-1 md:ml-64 flex items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center gap-6 max-w-md">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <Alert variant="destructive" className="mb-2">
              <AlertTitle className="text-lg">Erreur dans le chargement de l'application</AlertTitle>
              <AlertDescription>
                Nous avons rencontré un problème avec la clé API Google Maps. Veuillez configurer ou vérifier votre clé API.
              </AlertDescription>
            </Alert>
            <div className="flex gap-4">
              <Button 
                onClick={() => setIsApiKeyDialogOpen(true)} 
                className="px-4 py-2 bg-primary gap-2 flex items-center"
              >
                <KeyRound className="h-4 w-4" />
                Configurer la clé API
              </Button>
              <Button 
                onClick={handleReload} 
                variant="outline"
                className="px-4 py-2 gap-2 flex items-center"
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
  
  return (
    <div className="flex min-h-screen">
      <Navbar />
      
      <div className="flex-1 md:ml-64">
        <div className="container pt-6 pb-16 mx-auto">
          <div className="max-w-7xl mx-auto">
            <OptiFieldHeader 
              trackingActive={trackingActive}
              setTrackingActive={setTrackingActive}
            />
            
            <Tabs 
              value={selectedView} 
              onValueChange={setSelectedView}
              className="my-6"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="map">Carte</TabsTrigger>
                <TabsTrigger value="summary">Analyses</TabsTrigger>
                <TabsTrigger value="timeline">Historique</TabsTrigger>
              </TabsList>
              
              <TabsContent value="map" className="relative">
                <OptiFieldMap trackingActive={trackingActive} />
              </TabsContent>
              
              <TabsContent value="summary">
                <OptiFieldSummary />
              </TabsContent>
              
              <TabsContent value="timeline">
                <OptiFieldTimeline />
              </TabsContent>
            </Tabs>
            
            <OptiFieldChatInterface 
              trackingActive={trackingActive}
              setTrackingActive={setTrackingActive}
            />
          </div>
        </div>
      </div>
      
      {/* API Key Configuration Dialog */}
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurer la clé API Google Maps</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Clé API Google Maps</Label>
                <Input
                  id="api-key"
                  placeholder="Entrez votre clé API Google Maps"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Pour utiliser les cartes, vous devez fournir une clé API Google Maps valide avec les API Maps JavaScript et Geocoding activées.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveApiKey}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OptiField;
