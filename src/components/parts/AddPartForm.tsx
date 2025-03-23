
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { Camera, Image, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export interface PartFormValues {
  name: string;
  partNumber: string;
  category: string;
  manufacturer: string;
  price: string;
  stock: string;
  reorderPoint: string;
  location: string;
  compatibility: string;
  image: string;
}

interface AddPartFormProps {
  onSuccess?: (data: PartFormValues) => void;
  onCancel?: () => void;
}

export function AddPartForm({ onSuccess, onCancel }: AddPartFormProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  
  const form = useForm<PartFormValues>({
    defaultValues: {
      name: '',
      partNumber: '',
      category: '',
      manufacturer: '',
      price: '',
      stock: '',
      reorderPoint: '',
      location: 'Warehouse A',
      compatibility: '',
      image: 'https://images.unsplash.com/photo-1642742381109-81e94659e783?q=80&w=500&auto=format&fit=crop'
    }
  });

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
      toast.error('Could not access camera. Please check permissions.');
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
        setCapturedImage(imageDataUrl);
        
        // Update form
        form.setValue('image', imageDataUrl);
        
        // Stop the camera stream
        stopCamera();
      }
    }
  };

  const addNewCategory = () => {
    if (newCategory.trim() !== '') {
      setCustomCategories([...customCategories, newCategory.trim()]);
      form.setValue('category', newCategory.trim());
      setNewCategory('');
      setIsAddCategoryDialogOpen(false);
      toast.success(`Category "${newCategory.trim()}" added successfully`);
    }
  };

  function onSubmit(data: PartFormValues) {
    try {
      // Here you would typically send this data to a backend API
      // For now we'll just simulate success
      toast.success('Part added successfully');
      
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      toast.error('Failed to add part');
      console.error(error);
    }
  }

  // Clean up camera stream when component unmounts
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Air Filter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part Number</FormLabel>
                  <FormControl>
                    <Input placeholder="AF-JD-4290" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="flex items-center gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="filters">Filters</SelectItem>
                        <SelectItem value="engine">Engine</SelectItem>
                        <SelectItem value="drive">Drive System</SelectItem>
                        <SelectItem value="hydraulic">Hydraulic</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="brake">Brake System</SelectItem>
                        <SelectItem value="cooling">Cooling System</SelectItem>
                        {customCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => setIsAddCategoryDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Manufacturer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manufacturer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="John Deere">John Deere</SelectItem>
                      <SelectItem value="Case IH">Case IH</SelectItem>
                      <SelectItem value="New Holland">New Holland</SelectItem>
                      <SelectItem value="Kubota">Kubota</SelectItem>
                      <SelectItem value="Fendt">Fendt</SelectItem>
                      <SelectItem value="Massey Ferguson">Massey Ferguson</SelectItem>
                      <SelectItem value="Universal">Universal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="99.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock (units)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reorderPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Point</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5" {...field} />
                  </FormControl>
                  <FormDescription>
                    Minimum stock level before reordering
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage Location</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                      <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                      <SelectItem value="Service Center">Service Center</SelectItem>
                      <SelectItem value="Mobile Unit">Mobile Unit</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="compatibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipment Compatibility</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="John Deere 8R 410, John Deere 7R Series"
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  List equipment models separated by commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image</FormLabel>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    
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
                  </div>
                  
                  {/* Image preview */}
                  {field.value && (
                    <div className="mt-2 relative bg-muted rounded-md overflow-hidden w-full">
                      <div className="aspect-square w-full max-w-xs mx-auto">
                        <img
                          src={field.value}
                          alt="Part preview"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                  
                  <FormDescription>
                    Enter a URL for the part image or take a photo
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              Add Part
            </Button>
          </div>
        </form>
      </Form>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a custom category for your parts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input 
              placeholder="Enter new category name" 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)} 
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addNewCategory}>
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
