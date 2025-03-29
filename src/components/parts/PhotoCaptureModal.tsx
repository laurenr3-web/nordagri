
import React, { useRef, useState } from 'react';
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
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsCapturing(true);
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image trop volumineuse (max 5MB)");
      setIsCapturing(false);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onPhotoTaken(dataUrl);
      toast.success("Photo capturée");
      setIsCapturing(false);
      onClose();
    };
    reader.onerror = () => {
      toast.error("Erreur de lecture du fichier");
      setIsCapturing(false);
    };
    reader.readAsDataURL(file);
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
              // Forcer l'utilisation de l'input file sans vérifier la caméra d'abord
              // Cela améliore la compatibilité sur différents appareils
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className="mb-4"
            disabled={isCapturing}
          >
            <Camera className="h-4 w-4 mr-2" />
            {isCapturing ? "Traitement en cours..." : "Prendre une photo"}
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
