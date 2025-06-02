
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ImageMetadata } from '@/services/imageService';
import { Info, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ImageQualityIndicatorProps {
  metadata?: ImageMetadata;
  compact?: boolean;
}

export const ImageQualityIndicator: React.FC<ImageQualityIndicatorProps> = ({ 
  metadata, 
  compact = false 
}) => {
  if (!metadata) return null;

  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualityText = (quality?: string) => {
    switch (quality) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return 'Inconnue';
    }
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="outline" 
              className={`text-xs ${getQualityColor(metadata.quality)}`}
            >
              {getQualityText(metadata.quality)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              {metadata.dimensions && (
                <p>{metadata.dimensions.width} × {metadata.dimensions.height}px</p>
              )}
              {metadata.format && <p>Format: {metadata.format}</p>}
              {metadata.loadTime && (
                <p>Chargé en {metadata.loadTime}ms</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Qualité d'image</span>
        <Badge 
          variant="outline" 
          className={getQualityColor(metadata.quality)}
        >
          {getQualityText(metadata.quality)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        {metadata.dimensions && (
          <div>
            <span className="font-medium">Résolution:</span> {metadata.dimensions.width} × {metadata.dimensions.height}px
          </div>
        )}
        {metadata.format && (
          <div>
            <span className="font-medium">Format:</span> {metadata.format}
          </div>
        )}
        {metadata.loadTime && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="font-medium">Chargement:</span> {metadata.loadTime}ms
          </div>
        )}
      </div>
    </div>
  );
};
