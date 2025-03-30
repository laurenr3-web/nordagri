
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

interface CameraSectionProps {
  onCapture: (imageDataUrl: string) => void;
}

const CameraSection: React.FC<CameraSectionProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsOpen(true);
      
      // Short delay to ensure the popover is open before requesting camera
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(err => console.error("Error playing video:", err));
            setStreamActive(true);
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          toast.error('Could not access camera. Please check permissions.');
          setIsOpen(false);
        }
      }, 300);
    } catch (error) {
      console.error('Error initializing camera:', error);
      toast.error('Error initializing camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setStreamActive(false);
    setIsOpen(false);
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
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        onCapture(imageDataUrl);
        
        // Stop the camera stream
        stopCamera();
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      stopCamera();
    }
    setIsOpen(open);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" type="button" onClick={startCamera}>
          <Camera className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 space-y-4">
          <h4 className="font-medium">Take Photo</h4>
          
          {/* Video preview for camera */}
          <div className="relative bg-muted rounded-md overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full aspect-square object-cover"
            />
            {/* Hidden canvas for image capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex justify-between">
            {!streamActive ? (
              <div className="w-full text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Accessing camera...</p>
              </div>
            ) : (
              <div className="flex space-x-2 w-full">
                <Button type="button" onClick={captureImage} variant="secondary" className="flex-1">
                  Take Photo
                </Button>
                <Button type="button" onClick={stopCamera} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CameraSection;
