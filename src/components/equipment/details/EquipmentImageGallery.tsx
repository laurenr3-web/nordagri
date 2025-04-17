
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface EquipmentImageGalleryProps {
  equipment: EquipmentItem;
}

const EquipmentImageGallery: React.FC<EquipmentImageGalleryProps> = ({ equipment }) => {
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  useEffect(() => {
    const equipmentImages = [];
    
    if (equipment.image && equipment.image !== 'nul') {
      equipmentImages.push(equipment.image);
    }
    
    if (equipmentImages.length === 0) {
      equipmentImages.push("https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop");
    }
    
    setImages(equipmentImages);
    setCurrentIndex(0);
  }, [equipment]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${isMobile ? 'px-4 py-3' : 'p-6'} pb-2`}>
        <CardTitle className="text-base md:text-lg font-medium text-center md:text-left">Images</CardTitle>
        <CardDescription className="text-center md:text-left">Photos de l'équipement</CardDescription>
      </CardHeader>
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'} space-y-4`}>
        <div className="relative w-full overflow-hidden rounded-lg">
          <AspectRatio ratio={4 / 3} className="bg-muted">
            <img
              src={images[currentIndex]}
              alt={`${equipment.name} - image ${currentIndex + 1}`}
              className="object-cover w-full h-full transition-transform duration-500 hover:scale-105 cursor-pointer mx-auto max-w-[320px] md:max-w-none"
              onClick={() => setIsZoomOpen(true)}
            />
            {images.length > 1 && (
              <>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={() => setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                  onClick={() => setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 opacity-70 hover:opacity-100"
              onClick={() => setIsZoomOpen(true)}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </AspectRatio>
        </div>

        {images.length > 1 && (
          <div className="flex justify-center space-x-1 py-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">{equipment.name}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full max-h-[70vh] overflow-hidden rounded-lg">
            <img
              src={images[currentIndex]}
              alt={`${equipment.name} - image ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EquipmentImageGallery;
