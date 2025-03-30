
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { PartFormValues } from '../partFormTypes';

interface ImageFieldProps {
  form: UseFormReturn<PartFormValues>;
}

const ImageField: React.FC<ImageFieldProps> = ({ form }) => {
  const [imageError, setImageError] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  // Reset image error when URL changes
  React.useEffect(() => {
    setImageError(false);
  }, [form.watch('image')]);

  // Handle camera activation
  const activateCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access the camera. Please check permissions.");
    }
  };

  // Handle taking a photo
  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL and set as form value
        const imageDataURL = canvas.toDataURL('image/jpeg');
        form.setValue('image', imageDataURL);
        
        // Stop the camera stream
        stopCamera();
      }
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Clear the current image
  const clearImage = () => {
    form.setValue('image', '');
    setImageError(false);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          form.setValue('image', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Part Image</FormLabel>
            <div className="space-y-3">
              {!cameraActive && (
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field} 
                    />
                  </FormControl>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={activateCamera}
                    title="Take a photo"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  
                  <div className="relative">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      title="Upload image"
                    >
                      <Upload className="h-4 w-4" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleFileUpload}
                      />
                    </Button>
                  </div>
                </div>
              )}
              
              {cameraActive && (
                <div className="space-y-2">
                  <div className="relative border rounded-md overflow-hidden aspect-video">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button type="button" variant="secondary" onClick={stopCamera}>
                      Cancel
                    </Button>
                    <Button type="button" variant="default" onClick={takePhoto}>
                      Take Photo
                    </Button>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
              
              {field.value && !cameraActive && (
                <Card className="overflow-hidden">
                  <CardContent className="p-2 relative">
                    <img 
                      src={field.value} 
                      alt="Part preview"
                      className="w-full h-auto object-contain max-h-[200px]"
                      onError={() => setImageError(true)}
                      style={{ display: imageError ? 'none' : 'block' }}
                    />
                    {imageError && (
                      <div className="flex items-center justify-center h-[200px] bg-muted text-muted-foreground">
                        Invalid or inaccessible image URL
                      </div>
                    )}
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <FormDescription>
                Enter a URL, upload an image, or take a photo with your camera
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ImageField;
