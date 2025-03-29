
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoTaken: (imageData: string) => void;
}

const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({ 
  isOpen, 
  onClose,
  onPhotoTaken
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image trop volumineuse (max 5MB)");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onPhotoTaken(dataUrl);
        toast.success("Photo capturée");
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Prendre une photo</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-6">
          <Button 
            onClick={() => {
              // Vérifier si l'API est disponible
              if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error("Caméra non disponible", {
                  description: "Votre navigateur ne supporte pas l'accès à la caméra."
                });
                return;
              }
              
              // Demander la permission d'accès à la caméra
              navigator.mediaDevices.getUserMedia({ video: true })
                .then(() => {
                  // Ouvrir la caméra native de l'appareil si possible
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                })
                .catch(err => {
                  console.error("Erreur d'accès à la caméra:", err);
                  toast.error("Accès à la caméra refusé", {
                    description: "Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur."
                  });
                });
            }}
            className="mb-4"
          >
            <Camera className="h-4 w-4 mr-2" />
            Ouvrir la caméra
          </Button>
          
          <input 
            type="file" 
            ref={fileInputRef}
            accept="image/*" 
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <p className="text-sm text-muted-foreground">
            Cette fonctionnalité utilise l'appareil photo de votre appareil
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoCaptureModal;
