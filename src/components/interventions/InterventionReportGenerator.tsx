
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Send, Download, Upload } from 'lucide-react';
import { SignatureCanvas } from '@/components/forms/SignatureCanvas';
import { 
  exportInterventionToPDF, 
  sendInterventionReportByEmail 
} from '@/utils/pdf-export/intervention-report';
import { Intervention } from '@/types/Intervention';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface InterventionReportGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intervention: Intervention;
  onGenerateReport?: (reportData: {
    notes: string;
    signature: string;
    images: string[];
    recipientEmail?: string;
  }) => void;
}

export function InterventionReportGenerator({
  open,
  onOpenChange,
  intervention,
  onGenerateReport
}: InterventionReportGeneratorProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('edit');
  const [reportNotes, setReportNotes] = useState('');
  const [signature, setSignature] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDownload = async () => {
    setIsLoading(true);
    try {
      await exportInterventionToPDF(
        intervention, 
        {
          reportNotes,
          signature,
          images
        }
      );
      
      if (onGenerateReport) {
        onGenerateReport({
          notes: reportNotes,
          signature,
          images,
        });
      }
      
      toast.success(t('interventions.report.downloadSuccess'));
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(t('interventions.report.downloadError'), {
        description: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSend = async () => {
    if (!email) {
      toast.error(t('interventions.report.emailRequired'));
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await sendInterventionReportByEmail(
        intervention,
        email,
        {
          reportNotes,
          signature,
          images,
          subject: `Rapport d'intervention #${intervention.id}`,
          message: `Veuillez trouver ci-joint le rapport d'intervention concernant "${intervention.title}".`
        }
      );
      
      if (success) {
        toast.success(t('interventions.report.emailSent'), {
          description: t('interventions.report.emailSentDesc', { email })
        });
        
        if (onGenerateReport) {
          onGenerateReport({
            notes: reportNotes,
            signature,
            images,
            recipientEmail: email
          });
        }
      } else {
        toast.error(t('interventions.report.emailError'));
      }
    } catch (error) {
      console.error('Error sending report by email:', error);
      toast.error(t('interventions.report.emailError'), {
        description: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const fileList = Array.from(e.target.files);
    const newImages: string[] = [];
    
    const processImage = (file: File) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            resolve(event.target.result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    };
    
    Promise.all(fileList.map(processImage))
      .then((results) => {
        setImages([...images, ...results]);
      })
      .catch((error) => {
        console.error('Error processing images:', error);
        toast.error(t('interventions.report.imageError'));
      });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('interventions.report.title')}</DialogTitle>
          <DialogDescription>
            {t('interventions.report.description')}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">{t('common.edit')}</TabsTrigger>
            <TabsTrigger value="send">{t('common.send')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">{t('interventions.report.additionalNotes')}</Label>
                <Textarea
                  id="notes"
                  placeholder={t('interventions.report.notesPlaceholder')}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div>
                <Label>{t('interventions.report.images')}</Label>
                <div className="flex items-center gap-2 mb-2">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {images.map((src, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={src} 
                          alt={`Uploaded ${index + 1}`} 
                          className="h-20 w-full object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-5 w-5 absolute top-1 right-1"
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                        >
                          <span className="text-xs">×</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <SignatureCanvas
                  onSignatureCapture={setSignature}
                  label={t('interventions.report.signature')}
                  initialSignature={signature}
                />
              </div>
            </div>
            
            <Button
              onClick={handleDownload}
              disabled={isLoading}
              className="w-full mt-4"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('interventions.report.download')}
            </Button>
          </TabsContent>
          
          <TabsContent value="send" className="space-y-4 py-4">
            <div>
              <Label htmlFor="email">{t('interventions.report.recipientEmail')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <div className="font-medium text-sm">{t('interventions.report.summary')}</div>
              <div className="rounded border p-3 text-sm space-y-2">
                <p><strong>{t('interventions.title')}:</strong> {intervention.title}</p>
                <p><strong>{t('interventions.equipment')}:</strong> {intervention.equipment}</p>
                <p>
                  <strong>{t('interventions.status.label')}:</strong> {
                    intervention.status === 'completed' 
                      ? t('interventions.status.completed') 
                      : intervention.status === 'in-progress'
                        ? t('interventions.status.inProgress')
                        : t('interventions.status.scheduled')
                  }
                </p>
                <p>
                  <strong>{t('common.attachments')}:</strong> {
                    [
                      signature ? '1 signature' : '',
                      images.length > 0 ? `${images.length} image(s)` : ''
                    ].filter(Boolean).join(', ') || t('common.none')
                  }
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleSend}
              disabled={isLoading || !email}
              className="w-full mt-4"
            >
              <Send className="mr-2 h-4 w-4" />
              {t('interventions.report.send')}
            </Button>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
