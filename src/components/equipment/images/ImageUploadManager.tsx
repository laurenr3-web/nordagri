
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Image as ImageIcon, Archive, AlertCircle } from 'lucide-react';
import { ImageService } from '@/services/imageService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

interface ImageUploadManagerProps {
  onImageUploaded?: (imageUrl: string) => void;
  maxFiles?: number;
}

export const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  onImageUploaded,
  maxFiles = 5
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [compressionQuality, setCompressionQuality] = useState([0.8]);
  const [maxWidth, setMaxWidth] = useState([1920]);
  const [maxHeight, setMaxHeight] = useState([1080]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast.error('Veuillez sélectionner des fichiers image valides');
      return;
    }

    if (imageFiles.length > maxFiles) {
      toast.error(`Vous ne pouvez sélectionner que ${maxFiles} images maximum`);
      return;
    }

    setSelectedFiles(imageFiles);
  }, [maxFiles]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Veuillez sélectionner au moins une image');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Compression si activée
        let fileToUpload: File | Blob = file;
        if (compressionEnabled) {
          try {
            const compressedBlob = await ImageService.compressImage(
              file,
              maxWidth[0],
              maxHeight[0],
              compressionQuality[0]
            );
            
            fileToUpload = new File(
              [compressedBlob],
              file.name,
              { type: 'image/jpeg' }
            );
            
            console.log(`Image compressée: ${file.size} -> ${fileToUpload.size} bytes`);
          } catch (error) {
            console.error('Erreur de compression:', error);
            toast.error(`Erreur de compression pour ${file.name}`);
            continue;
          }
        }

        // Simuler l'upload (à remplacer par le vrai service d'upload)
        // TODO: Intégrer avec equipmentPhotoService
        const imageUrl = await simulateUpload(fileToUpload, file.name);
        
        if (onImageUploaded) {
          onImageUploaded(imageUrl);
        }

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      toast.success(`${selectedFiles.length} image(s) uploadée(s) avec succès`);
      setSelectedFiles([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur d\'upload:', error);
      toast.error('Erreur lors de l\'upload des images');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Simuler l'upload - à remplacer par le vrai service
  const simulateUpload = async (file: File | Blob, originalName: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Générer une URL temporaire pour la démo
        const url = URL.createObjectURL(file);
        resolve(url);
      }, 1000 + Math.random() * 2000);
    });
  };

  const getTotalSize = () => {
    return selectedFiles.reduce((total, file) => total + file.size, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Ajouter des photos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter des photos d'équipement</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sélection de fichiers */}
          <div>
            <Label htmlFor="image-upload">Sélectionner les images</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Formats supportés: JPG, PNG, WebP. Maximum {maxFiles} images.
            </p>
          </div>

          {/* Aperçu des fichiers sélectionnés */}
          {selectedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fichiers sélectionnés</CardTitle>
                <CardDescription>
                  {selectedFiles.length} image(s) - Taille totale: {ImageService.formatFileSize(getTotalSize())}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="space-y-2">
                      <div className="aspect-video bg-muted rounded overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-muted-foreground">
                          {ImageService.formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Options de compression */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Options de compression
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="compression-toggle">Activer la compression</Label>
                <Switch
                  id="compression-toggle"
                  checked={compressionEnabled}
                  onCheckedChange={setCompressionEnabled}
                />
              </div>

              {compressionEnabled && (
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div>
                    <Label>Qualité: {Math.round(compressionQuality[0] * 100)}%</Label>
                    <Slider
                      value={compressionQuality}
                      onValueChange={setCompressionQuality}
                      min={0.1}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Largeur max: {maxWidth[0]}px</Label>
                    <Slider
                      value={maxWidth}
                      onValueChange={setMaxWidth}
                      min={800}
                      max={3840}
                      step={160}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Hauteur max: {maxHeight[0]}px</Label>
                    <Slider
                      value={maxHeight}
                      onValueChange={setMaxHeight}
                      min={600}
                      max={2160}
                      step={120}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Barre de progression */}
          {uploading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload en cours...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={uploading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Upload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Uploader {selectedFiles.length} image(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
