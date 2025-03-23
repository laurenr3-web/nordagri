
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
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
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        
        // Pass image data to parent component
        onCapture(imageDataUrl);
        
        // Stop the camera stream
        stopCamera();
      }
    }
  };

  // Clean up camera stream when component unmounts
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" type="button">
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
              <Button type="button" onClick={startCamera} className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
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

export default CameraCapture;
