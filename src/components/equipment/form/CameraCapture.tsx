
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Camera, Image } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Démarrer la caméra
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setCapturedImage(null);
      setIsDialogOpen(true);
    } catch (error) {
      console.error('Erreur lors de l\'accès à la caméra:', error);
      alert('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.');
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setIsDialogOpen(false);
  };

  // Capturer une image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Ajuster la taille du canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Dessiner la vidéo sur le canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir en URL de données
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataUrl);
      }
    }
  };

  // Utiliser l'image capturée
  const useImage = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={startCamera}
        aria-label="Prendre une photo"
      >
        <Camera className="h-4 w-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) stopCamera();
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Prendre une photo</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            {!capturedImage ? (
              <div className="relative w-full max-h-[70vh] bg-muted rounded-md overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative w-full max-h-[70vh] bg-muted rounded-md overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
          
          <DialogFooter className="flex justify-between">
            {!capturedImage ? (
              <>
                <Button type="button" variant="outline" onClick={stopCamera}>
                  Annuler
                </Button>
                <Button type="button" onClick={captureImage}>
                  <Camera className="mr-2 h-4 w-4" />
                  Capturer
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => setCapturedImage(null)}>
                  Reprendre
                </Button>
                <Button type="button" onClick={useImage}>
                  <Image className="mr-2 h-4 w-4" />
                  Utiliser
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CameraCapture;
