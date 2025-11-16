import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Star } from 'lucide-react';
import { useEquipmentPhotos } from '@/hooks/equipment/useEquipmentPhotos';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface MultiPhotoUploaderProps {
  equipmentId: number | undefined;
}

const MultiPhotoUploader: React.FC<MultiPhotoUploaderProps> = ({ equipmentId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { photos, loading, uploading, uploadPhotos, deletePhoto, setPrimaryPhoto } = useEquipmentPhotos(equipmentId);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    await uploadPhotos(fileArray);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!equipmentId) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-center">
            Enregistrez l'équipement pour ajouter des photos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Photos de l'équipement</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Upload en cours...' : 'Ajouter des photos'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement des photos...
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune photo ajoutée
          </div>
        ) : (
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {photos.map((photo) => (
                  <CarouselItem key={photo.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="relative group">
                      <img
                        src={photo.photo_url}
                        alt={`Photo ${photo.display_order + 1}`}
                        className="w-full h-48 object-contain bg-muted/30 rounded-lg"
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant={photo.is_primary ? "default" : "secondary"}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPrimaryPhoto(photo.id)}
                          title={photo.is_primary ? "Photo principale" : "Définir comme principale"}
                        >
                          <Star className={`h-4 w-4 ${photo.is_primary ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => deletePhoto(photo.id, photo.photo_url)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      {photo.is_primary && (
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                            Principale
                          </span>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {photos.length > 3 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiPhotoUploader;
