
import React, { useState, useRef } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Camera, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const equipmentFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  type: z.string().min(1, { message: 'Please select a type.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  manufacturer: z.string().min(2, { message: 'Manufacturer must be at least 2 characters.' }),
  model: z.string().min(1, { message: 'Model is required.' }),
  year: z.string().regex(/^\d{4}$/, { message: 'Please enter a valid year (e.g., 2023).' }),
  serialNumber: z.string().min(1, { message: 'Serial number is required.' }),
  status: z.string().min(1, { message: 'Please select a status.' }),
  location: z.string().min(1, { message: 'Location is required.' }),
  purchaseDate: z.string().min(1, { message: 'Purchase date is required.' }),
  notes: z.string().optional(),
  image: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

interface EquipmentFormProps {
  onSubmit: (data: EquipmentFormValues) => void;
  onCancel: () => void;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ onSubmit, onCancel }) => {
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamActive, setStreamActive] = useState(false);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: '',
      type: '',
      category: '',
      manufacturer: '',
      model: '',
      year: new Date().getFullYear().toString(),
      serialNumber: '',
      status: 'operational',
      location: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
      image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
    },
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

  const handleSubmit = (data: EquipmentFormValues) => {
    try {
      onSubmit(data);
      toast.success("Equipment added successfully.", {
        description: `${data.name} has been added successfully.`
      });
    } catch (error) {
      toast.error("Failed to add equipment", {
        description: "Please try again."
      });
    }
  };

  const addNewCategory = () => {
    if (newCategory.trim() !== '') {
      setCustomCategories([...customCategories, newCategory.trim()]);
      form.setValue('category', newCategory.trim());
      setNewCategory('');
      setIsAddCategoryDialogOpen(false);
      toast.success("Category added", {
        description: `"${newCategory.trim()}" has been added as a category.`
      });
    }
  };

  // Clean up camera stream when component unmounts
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Deere 8R 410" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Tractor">Tractor</SelectItem>
                      <SelectItem value="Harvester">Harvester</SelectItem>
                      <SelectItem value="Truck">Truck</SelectItem>
                      <SelectItem value="Implement">Implement</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <SelectItem value="heavy">Heavy Machinery</SelectItem>
                        <SelectItem value="medium">Medium Machinery</SelectItem>
                        <SelectItem value="light">Light Equipment</SelectItem>
                        <SelectItem value="attachments">Attachments</SelectItem>
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
                  <FormControl>
                    <Input placeholder="e.g., John Deere" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 8R 410" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., JD8R410-22-7834" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">In Maintenance</SelectItem>
                      <SelectItem value="repair">Needs Repair</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., North Field" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purchase Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
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
                        <Input placeholder="Enter image URL" {...field} />
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
                            alt="Equipment preview"
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                    )}
                    
                    <FormDescription>
                      Enter a URL for the equipment image or take a photo
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter any additional information about this equipment"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Equipment</Button>
          </div>
        </form>
      </Form>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a custom category for your equipment
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
};

export default EquipmentForm;
