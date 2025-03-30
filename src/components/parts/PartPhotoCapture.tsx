
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { IdentifiedPartResult } from '@/hooks/parts/usePartVisionIdentification';

interface PartPhotoCaptureProps {
  onPhotoTaken: (imageBase64: string) => void;
  isLoading?: boolean;
  onIdentifyPhoto?: (imageBase64: string) => Promise<IdentifiedPartResult | null>;
  identificationInProgress?: boolean;
}

const PartPhotoCapture: React.FC<PartPhotoCaptureProps> = ({ 
  onPhotoTaken, 
  isLoading = false,
  onIdentifyPhoto,
  identificationInProgress = false
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Activer la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Utiliser la caméra arrière sur mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        // Store stream reference for cleanup
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Erreur d'accès à la caméra:", err);
      toast.error("Impossible d'accéder à la caméra", {
        description: "Veuillez vérifier les permissions ou utiliser l'upload de photo."
      });
    }
  };
  
  // Arrêter la caméra
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
  };
  
  // Prendre une photo
  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
        
        onPhotoTaken(dataUrl);
        
        // Si l'identification est activée, l'exécuter automatiquement
        if (onIdentifyPhoto) {
          onIdentifyPhoto(dataUrl);
        }
      }
    }
  };
  
  // Upload d'image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image trop volumineuse", {
          description: "L'image ne doit pas dépasser 5MB."
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
        onPhotoTaken(dataUrl);
        
        // Si l'identification est activée, l'exécuter automatiquement
        if (onIdentifyPhoto) {
          onIdentifyPhoto(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Annuler/réinitialiser
  const resetImage = () => {
    setCapturedImage(null);
    stopCamera();
  };
  
  // Nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      // Stop camera when component unmounts
      stopCamera();
      
      // Reset file input if it exists
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
  }, []);
  
  return (
    <div className="w-full space-y-4">
      {capturedImage ? (
        <div className="relative">
          <img 
            src={capturedImage} 
            alt="Photo de la pièce" 
            className="w-full h-auto rounded-lg object-cover max-h-96"
          />
          <Button 
            size="icon" 
            variant="destructive" 
            className="absolute top-2 right-2" 
            onClick={resetImage}
          >
            <X size={18} />
          </Button>
        </div>
      ) : isCameraActive ? (
        <div className="relative">
          <video 
            ref={videoRef} 
            className="w-full h-auto rounded-lg max-h-96 bg-black"
            autoPlay 
            playsInline
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button 
              className="rounded-full w-16 h-16 bg-white border-4 border-primary"
              onClick={takePhoto}
            >
              <Camera size={24} className="text-primary" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center h-48 bg-gray-50">
            <p className="text-muted-foreground mb-4">
              Prenez une photo claire de la pièce pour l'identifier
            </p>
            <div className="flex gap-2">
              <Button onClick={startCamera} className="flex items-center gap-2">
                <Camera size={18} />
                Utiliser la caméra
              </Button>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload size={18} />
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
        </div>
      )}
      
      {capturedImage && (isLoading || identificationInProgress) && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RotateCw className="h-4 w-4 animate-spin" />
            {identificationInProgress ? "Identification de la pièce en cours..." : "Analyse de l'image en cours..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartPhotoCapture;
