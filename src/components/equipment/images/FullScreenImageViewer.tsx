
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Maximize,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImageMetadata } from '@/services/imageService';
import { cn } from '@/lib/utils';

interface FullScreenImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  equipmentName?: string;
  metadata?: Map<string, ImageMetadata>;
}

export const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onIndexChange,
  equipmentName = 'Équipement',
  metadata
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentImage = images[currentIndex];
  const currentMetadata = currentImage ? metadata?.get(currentImage) : undefined;

  // Reset zoom and rotation when image changes
  useEffect(() => {
    setZoom(1);
    setRotation(0);
    setPanPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) onIndexChange(currentIndex - 1);
          break;
        case 'ArrowRight':
          if (currentIndex < images.length - 1) onIndexChange(currentIndex + 1);
          break;
        case '+':
        case '=':
          setZoom(prev => Math.min(prev * 1.2, 5));
          break;
        case '-':
          setZoom(prev => Math.max(prev / 1.2, 0.1));
          break;
        case '0':
          setZoom(1);
          setPanPosition({ x: 0, y: 0 });
          break;
        case 'r':
          setRotation(prev => (prev + 90) % 360);
          break;
        case 'i':
          setShowInfo(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length, onClose, onIndexChange]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
  }, []);

  // Download image
  const handleDownload = async () => {
    if (!currentImage) return;
    
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${equipmentName}_${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black/95">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h2 className="text-lg font-semibold">{equipmentName}</h2>
                <p className="text-sm text-gray-300">
                  {currentIndex + 1} / {images.length}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setShowInfo(!showInfo)}>
                  <Info className="h-4 w-4 text-white" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image */}
          <div 
            className="flex-1 flex items-center justify-center cursor-move"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={currentImage}
              alt={`${equipmentName} - ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg) translate(${panPosition.x}px, ${panPosition.y}px)`,
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
              draggable={false}
            />
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              {/* Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onIndexChange(Math.min(images.length - 1, currentIndex + 1))}
                  disabled={currentIndex === images.length - 1}
                  className="text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Zoom and rotation controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(prev => Math.max(0.1, prev / 1.2))}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-white text-sm min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setZoom(prev => Math.min(5, prev * 1.2))}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Metadata info panel */}
          {showInfo && currentMetadata && (
            <div className="absolute top-20 right-4 bg-black/90 text-white p-4 rounded-lg max-w-xs">
              <h3 className="font-semibold mb-2">Informations de l'image</h3>
              <div className="space-y-1 text-sm">
                {currentMetadata.dimensions && (
                  <p>Résolution: {currentMetadata.dimensions.width} × {currentMetadata.dimensions.height}px</p>
                )}
                {currentMetadata.format && (
                  <p>Format: {currentMetadata.format}</p>
                )}
                {currentMetadata.size && (
                  <p>Taille: {(currentMetadata.size / 1024 / 1024).toFixed(2)} MB</p>
                )}
                {currentMetadata.loadTime && (
                  <p>Temps de chargement: {currentMetadata.loadTime}ms</p>
                )}
                {currentMetadata.quality && (
                  <div className="flex items-center gap-2">
                    <span>Qualité:</span>
                    <Badge variant="outline" className="text-xs">
                      {currentMetadata.quality === 'high' ? 'Haute' : 
                       currentMetadata.quality === 'medium' ? 'Moyenne' : 'Faible'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
