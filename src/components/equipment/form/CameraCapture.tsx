
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Smartphone, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isMobile = useIsMobile();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Clean up camera stream when component unmounts or popover closes
  useEffect(() => {
    if (!popoverOpen) {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [popoverOpen]);

  const startCamera = async () => {
    // Reset error state
    setCameraError(null);
    
    try {
      // First stop any active stream
      stopCamera();
      
      // Try to get camera access with specified facing mode
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      console.log(`Attempting to access camera with facing mode: ${facingMode}`);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) videoRef.current.play();
        };
        setStreamActive(true);
        console.log('Camera stream started successfully');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = 'Impossible d\'accéder à la caméra. ';
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'Aucune caméra détectée sur votre appareil.';
        } else if (error.name === 'NotReadableError') {
          errorMessage += 'La caméra est peut-être utilisée par une autre application.';
        } else {
          errorMessage += `Erreur: ${error.message}`;
        }
      } else {
        errorMessage += 'Veuillez vérifier les permissions et réessayer.';
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
      console.log('Camera stream stopped');
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas content to data URL
        try {
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          
          // Pass image data to parent component
          onCapture(imageDataUrl);
          
          // Show success message
          toast.success('Photo capturée avec succès');
          
          // Stop the camera stream and close popover
          stopCamera();
          setPopoverOpen(false);
        } catch (error) {
          console.error('Error converting canvas to data URL:', error);
          toast.error('Erreur lors de la capture de l\'image');
        }
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        onCapture(imageDataUrl);
        toast.success('Image chargée avec succès');
      };
      
      reader.onerror = () => {
        toast.error('Erreur lors de la lecture du fichier');
      };
      
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    // Restart camera with new facing mode
    setTimeout(startCamera, 100);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" type="button">
            <Camera className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Prendre une photo</h4>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setPopoverOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Video preview for camera */}
            <div className="relative bg-muted rounded-md overflow-hidden">
              {cameraError ? (
                <div className="aspect-square w-full flex items-center justify-center bg-muted p-4 text-center text-sm text-muted-foreground">
                  {cameraError}
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline
                  className="w-full aspect-square object-cover"
                />
              )}
              {/* Hidden canvas for image capture */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="space-y-2">
              {!streamActive ? (
                <div className="flex flex-col space-y-2">
                  <Button type="button" onClick={startCamera} className="w-full">
                    <Camera className="mr-2 h-4 w-4" />
                    Activer la caméra
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        ou
                      </span>
                    </div>
                  </div>
                  
                  <Button type="button" variant="outline" onClick={triggerFileUpload} className="w-full">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Choisir depuis l'appareil
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2 w-full">
                    <Button type="button" onClick={captureImage} className="flex-1">
                      Prendre la photo
                    </Button>
                    {isMobile && (
                      <Button type="button" onClick={switchCamera} variant="outline" size="icon">
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Button type="button" onClick={stopCamera} variant="outline" className="w-full">
                    Annuler
                  </Button>
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Hidden file input for uploading images from device */}
      <input 
        type="file" 
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        className="hidden"
      />
    </>
  );
};

export default CameraCapture;
