
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Layers,
  MapPin,
  Navigation,
  Maximize,
  Minimize
} from 'lucide-react';
import MapPlaceholder from './MapPlaceholder';

interface OptiFieldMapProps {
  trackingActive: boolean;
}

const OptiFieldMap: React.FC<OptiFieldMapProps> = ({ trackingActive }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapApiKey, setMapApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
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

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gmaps_api_key');
    if (savedApiKey) {
      setMapApiKey(savedApiKey);
      setShowApiKeyInput(false);
    }

    // This would be where we'd initialize the Google Maps API
    // if we had a valid API key
  }, []);

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
