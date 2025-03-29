
import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Utiliser la caméra arrière sur mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error("Erreur d'accès à la caméra:", err);
      toast.error("Impossible d'accéder à la caméra", {
        description: "Veuillez autoriser l'accès à la caméra ou utiliser l'upload de photo."
      });
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };
  
  // Démarrer la caméra quand le modal s'ouvre
  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    // Nettoyage
    return () => {
      stopCamera();
    };
  }, [isOpen]);
  
  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        onPhotoTaken(dataUrl);
        onClose();
      }
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Prendre une photo de pièce</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {stream ? (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-auto"
              />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <Button 
                  size="lg" 
                  className="rounded-full w-14 h-14"
                  onClick={takePhoto}
                >
                  <span className="sr-only">Prendre une photo</span>
                  <div className="w-10 h-10 rounded-full border-2 border-white" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-4 text-center">
              <Camera className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Prenez une photo de la pièce pour l'identifier
              </p>
              <div className="flex gap-2">
                <Button onClick={startCamera}>
                  Activer la caméra
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choisir une image
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoCaptureModal;
