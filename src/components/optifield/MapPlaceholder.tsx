
import React, { useState } from 'react';
import { Tractor, Navigation, CheckCircle2 } from 'lucide-react';

interface MapPlaceholderProps {
  trackingActive: boolean;
}

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ trackingActive }) => {
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  
  const handleMachineClick = (machineName: string) => {
    setSelectedMachine(machineName === selectedMachine ? null : machineName);
  };
  
  return (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        {/* Grid lines to simulate a map */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Field Outlines */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/3 border-2 border-green-500 rounded-lg opacity-60"></div>
        <div className="absolute top-1/2 left-1/8 w-1/4 h-1/4 border-2 border-green-700 rounded-lg opacity-60"></div>
        
        {/* Tractor Position - Main Machine */}
        <div 
          className={`absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 ${
            trackingActive ? 'animate-pulse' : ''
          } cursor-pointer group`}
          onClick={() => handleMachineClick('Tracteur John Deere')}
        >
          <div className={`bg-primary text-white p-2 rounded-full group-hover:bg-primary/90 ${selectedMachine === 'Tracteur John Deere' ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
            <Tractor size={24} />
          </div>
          {trackingActive && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
          )}
          {selectedMachine === 'Tracteur John Deere' && (
            <div className="absolute -top-1 -right-1">
              <CheckCircle2 className="h-4 w-4 text-green-500 fill-white" />
            </div>
          )}
        </div>

        {/* Second Machine */}
        <div 
          className="absolute top-1/2 left-2/3 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          onClick={() => handleMachineClick('Moissonneuse Claas')}
        >
          <div className={`bg-amber-600 text-white p-2 rounded-full group-hover:bg-amber-500 ${selectedMachine === 'Moissonneuse Claas' ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}>
            <Tractor size={24} />
          </div>
          {selectedMachine === 'Moissonneuse Claas' && (
            <div className="absolute -top-1 -right-1">
              <CheckCircle2 className="h-4 w-4 text-green-500 fill-white" />
            </div>
          )}
        </div>
        
        {/* Tracked Path */}
        {trackingActive && (
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            <path 
              d="M200,200 C220,230 240,240 280,250 S320,270 340,290 S380,320 400,330" 
              stroke="#3b82f6" 
              strokeWidth="3" 
              fill="none" 
              strokeDasharray="5,5" 
            />
          </svg>
        )}
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-sm text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Ceci est une simulation de carte. Avec une clé API Google Maps valide,
          vous verriez ici la carte réelle avec les positions de vos équipements.
        </p>
        {selectedMachine && (
          <div className="text-sm font-medium text-primary mb-2">
            Machine sélectionnée: {selectedMachine}
          </div>
        )}
        {trackingActive ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Navigation className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Suivi de position actif</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Navigation className="h-4 w-4" />
            <span className="text-sm font-medium">Suivi de position inactif</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPlaceholder;
