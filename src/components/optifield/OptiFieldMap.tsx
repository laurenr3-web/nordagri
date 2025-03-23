
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Layers,
  MapPin,
  Navigation,
  Maximize,
  Minimize,
  Tractor
} from 'lucide-react';
import MapPlaceholder from './MapPlaceholder';
import { toast } from 'sonner';

interface OptiFieldMapProps {
  trackingActive: boolean;
}

const OptiFieldMap: React.FC<OptiFieldMapProps> = ({ trackingActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapApiKey, setMapApiKey] = useState<string>('AIzaSyDYNpssW98FUa34qBKCD6JdI7iWYnzFxyI');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [selectedMachines, setSelectedMachines] = useState<string[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSaveApiKey = () => {
    if (mapApiKey.trim()) {
      localStorage.setItem('gmaps_api_key', mapApiKey);
      setShowApiKeyInput(false);
    }
  };

  const handleMachineSelected = (machineName: string) => {
    // For demonstration, we'll use the toast to show the selection
    toast.success(`Machine sélectionnée: ${machineName}`);
    setSelectedMachines(prev => 
      prev.includes(machineName) 
        ? prev.filter(name => name !== machineName) 
        : [...prev, machineName]
    );
  };

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gmaps_api_key');
    if (savedApiKey) {
      setMapApiKey(savedApiKey);
    } else {
      // Save the default API key to localStorage
      localStorage.setItem('gmaps_api_key', mapApiKey);
    }

    // This would be where we'd initialize the Google Maps API
    // if we had a valid API key
  }, [mapApiKey]);

  return (
    <Card className={`overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[70vh]'}`}>
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-white/80 backdrop-blur-sm"
        >
          <Layers className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-white/80 backdrop-blur-sm"
        >
          <MapPin className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-white/80 backdrop-blur-sm"
        >
          <Navigation className="h-4 w-4" />
        </Button>
        <Button 
          variant="secondary" 
          size="icon" 
          className="bg-white/80 backdrop-blur-sm"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>

      {selectedMachines.length > 0 && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
            <div className="text-sm font-medium mb-1">Machines sélectionnées</div>
            <div className="flex flex-col gap-1">
              {selectedMachines.map(machine => (
                <div key={machine} className="flex items-center gap-2 text-xs">
                  <Tractor className="h-3 w-3" />
                  <span>{machine}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div ref={mapContainerRef} className="h-full w-full">
        {showApiKeyInput ? (
          <div className="h-full flex flex-col items-center justify-center p-8">
            <h3 className="text-lg font-medium mb-4">Clé API Google Maps requise</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Pour utiliser la fonctionnalité de carte, veuillez entrer votre clé API Google Maps.
              Cette clé sera sauvegardée localement.
            </p>
            <div className="w-full max-w-md space-y-4">
              <input
                type="text"
                value={mapApiKey}
                onChange={(e) => setMapApiKey(e.target.value)}
                placeholder="Entrez votre clé API Google Maps"
                className="w-full px-4 py-2 border rounded-md"
              />
              <Button 
                className="w-full" 
                onClick={handleSaveApiKey}
                disabled={!mapApiKey.trim()}
              >
                Sauvegarder et afficher la carte
              </Button>
            </div>
          </div>
        ) : (
          <MapPlaceholder trackingActive={trackingActive} />
        )}
      </div>
    </Card>
  );
};

export default OptiFieldMap;
