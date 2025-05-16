
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Intervention } from '@/types/Intervention';
import { FileText, Send, Printer, Mail, Image, FileCheck, Edit, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { interventionReportService } from '@/services/reports/interventionReportService';
import { SignatureCanvas } from '@/components/signature/SignatureCanvas';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQueryClient } from '@tanstack/react-query';
import { useOfflineStatus } from '@/providers/OfflineProvider';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  maxFiles?: number;
  fileList: File[];
  onRemoveFile: (index: number) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelected, 
  maxFiles = 5, 
  fileList,
  onRemoveFile
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (fileList.length + files.length <= maxFiles) {
        for (let i = 0; i < files.length; i++) {
          onFileSelected(files[i]);
        }
      } else {
        toast.error(`Vous ne pouvez pas ajouter plus de ${maxFiles} photos`);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="photos" className="text-sm font-medium">
          Photos d'intervention ({fileList.length}/{maxFiles})
        </Label>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('photos')?.click()}
          disabled={fileList.length >= maxFiles}
        >
          <Image className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      <input
        id="photos"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={fileList.length >= maxFiles}
      />

      {fileList.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {fileList.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={`Photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="absolute top-1 right-1 bg-gray-800/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 border-2 border-dashed rounded-md text-center text-muted-foreground">
          <p className="text-sm">Aucune photo sélectionnée</p>
        </div>
      )}
    </div>
  );
};

interface InterventionReportPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intervention: Intervention | null;
}

const InterventionReportPdfDialog: React.FC<InterventionReportPdfDialogProps> = ({
  open,
  onOpenChange,
  intervention
}) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [signature, setSignature] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();
  const { isOnline } = useOfflineStatus();
  
  const emailForm = useForm({
    defaultValues: {
      to: '',
      subject: intervention ? `Rapport d'intervention #${intervention.id} - ${intervention.title}` : '',
      message: intervention 
        ? `Veuillez trouver ci-joint le rapport d'intervention concernant ${intervention.equipment}.` 
        : ''
    }
  });
  
  const reportForm = useForm({
    defaultValues: {
      includeSignature: true,
      includePhotos: true,
      includeParts: true,
      includeContact: true,
      farmName: 'NordAgri',
      contactPhone: '',
      contactEmail: '',
      contactAddress: ''
    }
  });

  const handleAddPhoto = (file: File) => {
    setPhotoFiles(prev => [...prev, file]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (!intervention || photoFiles.length === 0) return [];
    
    try {
      const urls = [];
      for (const file of photoFiles) {
        const url = URL.createObjectURL(file);
        urls.push(url);
      }
      setPhotoUrls(urls);
      return urls;
    } catch (error) {
      console.error('Erreur lors de l\'upload des photos:', error);
      toast.error('Erreur lors de l\'upload des photos');
      return [];
    }
  };

  const handleGeneratePDF = async () => {
    if (!intervention) return;
    
    try {
      setIsGenerating(true);
      
      // Uploader les photos si nécessaire
      let uploadedPhotoUrls: string[] = [];
      if (reportForm.getValues('includePhotos') && photoFiles.length > 0) {
        uploadedPhotoUrls = await uploadPhotos();
      }
      
      // Générer et télécharger le PDF
      await interventionReportService.downloadReport(
        intervention,
        reportForm.getValues('includeSignature') ? signature : undefined,
        reportForm.getValues('includePhotos') ? uploadedPhotoUrls : undefined,
        {
          farmName: reportForm.getValues('farmName'),
          includeSignature: reportForm.getValues('includeSignature'),
          includePhotos: reportForm.getValues('includePhotos'),
          includeParts: reportForm.getValues('includeParts'),
          includeContact: reportForm.getValues('includeContact'),
          contactInfo: {
            phone: reportForm.getValues('contactPhone'),
            email: reportForm.getValues('contactEmail'),
            address: reportForm.getValues('contactAddress')
          }
        }
      );
      
      toast.success('Rapport PDF généré et téléchargé');
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!intervention) return;
    if (!isOnline) {
      toast.error('Vous devez être connecté à Internet pour envoyer un email');
      return;
    }
    
    try {
      setIsSending(true);
      
      // Uploader les photos si nécessaire
      let uploadedPhotoUrls: string[] = [];
      if (reportForm.getValues('includePhotos') && photoFiles.length > 0) {
        uploadedPhotoUrls = await uploadPhotos();
      }
      
      // Envoyer l'email
      const success = await interventionReportService.sendReportByEmail(
        intervention,
        emailForm.getValues('to'),
        emailForm.getValues('subject'),
        emailForm.getValues('message'),
        reportForm.getValues('includeSignature') ? signature : undefined,
        reportForm.getValues('includePhotos') ? uploadedPhotoUrls : undefined,
        {
          farmName: reportForm.getValues('farmName'),
          includeSignature: reportForm.getValues('includeSignature'),
          includePhotos: reportForm.getValues('includePhotos'),
          includeParts: reportForm.getValues('includeParts'),
          includeContact: reportForm.getValues('includeContact'),
          contactInfo: {
            phone: reportForm.getValues('contactPhone'),
            email: reportForm.getValues('contactEmail'),
            address: reportForm.getValues('contactAddress')
          }
        }
      );
      
      if (success) {
        toast.success('Rapport envoyé par email avec succès');
        onOpenChange(false);
        
        // Actualiser les données pour refléter l'envoi du rapport
        queryClient.invalidateQueries({ queryKey: ['interventions', intervention.id] });
      } else {
        toast.error('Erreur lors de l\'envoi du rapport par email');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rapport par email:', error);
      toast.error('Erreur lors de l\'envoi du rapport par email');
    } finally {
      setIsSending(false);
    }
  };

  if (!intervention) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileCheck className="mr-2 h-5 w-5" />
            Rapport d'intervention PDF
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="generate">
                <FileText className="h-4 w-4 mr-2" />
                Générer un PDF
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="h-4 w-4 mr-2" />
                Envoyer par email
              </TabsTrigger>
            </TabsList>
            
            {/* Onglet de génération PDF */}
            <TabsContent value="generate" className="space-y-4 py-4">
              <Form {...reportForm}>
                <form className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-sm font-medium mb-3">En-tête du rapport</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={reportForm.control}
                          name="farmName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de l'exploitation</FormLabel>
                              <FormControl>
                                <Input placeholder="NordAgri" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={reportForm.control}
                          name="contactAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Rue de l'Agriculture" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={reportForm.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone</FormLabel>
                              <FormControl>
                                <Input placeholder="01 23 45 67 89" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={reportForm.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="contact@nordagri.fr" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <h3 className="text-sm font-medium">Éléments à inclure</h3>
                      
                      <div className="space-y-2">
                        <FormField
                          control={reportForm.control}
                          name="includeSignature"
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="includeSignature"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <label
                                htmlFor="includeSignature"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Inclure la signature
                              </label>
                            </div>
                          )}
                        />
                        
                        <FormField
                          control={reportForm.control}
                          name="includePhotos"
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="includePhotos"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <label
                                htmlFor="includePhotos"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Inclure les photos
                              </label>
                            </div>
                          )}
                        />
                        
                        <FormField
                          control={reportForm.control}
                          name="includeParts"
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="includeParts"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <label
                                htmlFor="includeParts"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Inclure les pièces utilisées
                              </label>
                            </div>
                          )}
                        />
                        
                        <FormField
                          control={reportForm.control}
                          name="includeContact"
                          render={({ field }) => (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="includeContact"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <label
                                htmlFor="includeContact"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Inclure les informations de contact
                              </label>
                            </div>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {reportForm.watch('includeSignature') && (
                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-sm font-medium mb-3">Signature du technicien</h3>
                        <SignatureCanvas
                          width={260}
                          height={130}
                          onChange={setSignature}
                          className="mx-auto"
                        />
                      </CardContent>
                    </Card>
                  )}
                  
                  {reportForm.watch('includePhotos') && (
                    <Card>
                      <CardContent className="pt-6">
                        <FileUpload
                          onFileSelected={handleAddPhoto}
                          fileList={photoFiles}
                          onRemoveFile={handleRemovePhoto}
                        />
                      </CardContent>
                    </Card>
                  )}
                </form>
              </Form>
              
              <DialogFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Annuler
                </Button>
                
                <Button 
                  disabled={isGenerating}
                  onClick={handleGeneratePDF}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération...
                    </>
                  ) : (
                    <>
                      <Printer className="h-4 w-4 mr-2" /> Télécharger le PDF
                    </>
                  )}
                </Button>
              </DialogFooter>
            </TabsContent>
            
            {/* Onglet d'envoi par email */}
            <TabsContent value="email" className="space-y-4 py-4">
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleSendEmail)} className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <FormField
                        control={emailForm.control}
                        name="to"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destinataire</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="destinataire@example.com" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Objet</FormLabel>
                            <FormControl>
                              <Input placeholder="Rapport d'intervention" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={emailForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Message d'accompagnement"
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                  
                  {/* Options du rapport */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Options du rapport</h3>
                    
                    {/* Réutiliser les mêmes options que dans l'onglet de génération */}
                    <Card>
                      <CardContent className="pt-6 space-y-4">
                        <p className="text-muted-foreground text-xs">
                          Le rapport PDF sera joint à l'email avec les mêmes options que celles définies dans l'onglet "Générer un PDF".
                        </p>
                        
                        <div className="text-sm">
                          {reportForm.watch('includeSignature') && (
                            <div className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-500" />
                              <span>Signature incluse</span>
                            </div>
                          )}
                          
                          {reportForm.watch('includePhotos') && (
                            <div className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-500" />
                              <span>Photos incluses ({photoFiles.length})</span>
                            </div>
                          )}
                          
                          {reportForm.watch('includeParts') && (
                            <div className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-500" />
                              <span>Pièces utilisées incluses</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <DialogFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Annuler
                    </Button>
                    
                    <Button 
                      type="button"
                      onClick={handleSendEmail}
                      disabled={isSending || !isOnline}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Envoi...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" /> Envoyer par email
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default InterventionReportPdfDialog;
