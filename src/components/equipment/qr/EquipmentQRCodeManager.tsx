
import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AlertTriangle, Download, Printer, QrCode, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { qrCodeService, type EquipmentQRCode } from '@/services/supabase/qrCodeService';
import { Skeleton } from '@/components/ui/skeleton';

interface EquipmentQRCodeManagerProps {
  equipmentId: number;
  equipmentName: string;
}

const EquipmentQRCodeManager: React.FC<EquipmentQRCodeManagerProps> = ({ 
  equipmentId, 
  equipmentName 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<EquipmentQRCode | null>(null);
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const loadQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Vérifier si un QR code existe déjà
      let existingQRCode = await qrCodeService.getQRCodeForEquipment(equipmentId);
      
      // Si aucun QR code n'existe, en créer un nouveau
      if (!existingQRCode) {
        existingQRCode = await qrCodeService.createQRCode(equipmentId);
      }
      
      setQrCode(existingQRCode);
    } catch (err: any) {
      console.error('Erreur lors du chargement du QR code:', err);
      setError(err.message || "Impossible de charger le QR code");
      toast.error("Erreur lors du chargement du QR code");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateQRCode = async () => {
    try {
      setLoading(true);
      
      // Régénérer le QR code
      const newQRCode = await qrCodeService.regenerateQRCode(equipmentId);
      setQrCode(newQRCode);
      
      toast.success("QR code régénéré avec succès");
      setIsRegenerateDialogOpen(false);
    } catch (err: any) {
      console.error('Erreur lors de la régénération du QR code:', err);
      toast.error("Erreur lors de la régénération du QR code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (equipmentId) {
      loadQRCode();
    }
  }, [equipmentId]);

  // Construire l'URL complète pour le QR code
  const baseUrl = window.location.origin;
  const qrUrl = qrCode ? `${baseUrl}/scan/${qrCode.qr_code_hash}` : '';

  const handleDownload = () => {
    const svg = qrCodeRef.current?.querySelector('svg');
    if (!svg) return;

    // Créer un canvas pour convertir le SVG en PNG
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Créer une image temporaire pour dessiner le SVG
    const img = new Image();
    
    // Convertir le SVG en data URL
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Définir les dimensions du canvas
      canvas.width = 1000;
      canvas.height = 1000;
      
      // Dessiner l'image sur le canvas avec un fond blanc
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Ajouter le nom de l'équipement en bas du QR code
      ctx.font = '30px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'black';
      
      // Nom de l'équipement
      ctx.fillText(equipmentName, canvas.width / 2, canvas.height - 60);
      
      // Convertir le canvas en data URL et télécharger
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `qrcode-${equipmentName.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer
      URL.revokeObjectURL(url);
      
      toast.success('QR Code téléchargé avec succès');
    };
    
    img.src = url;
  };

  const handlePrint = () => {
    if (!qrCode) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression');
      return;
    }

    // Créer une page d'impression avec le QR code et les informations
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${equipmentName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #ccc;
              padding: 20px;
              border-radius: 8px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 5px;
            }
            h2 {
              font-size: 18px;
              color: #666;
              margin-bottom: 30px;
            }
            .qr-container {
              width: 300px;
              height: 300px;
              margin: 20px auto;
            }
            .url {
              font-size: 12px;
              color: #666;
              margin-top: 20px;
            }
            .instructions {
              text-align: left;
              font-size: 14px;
              margin-top: 40px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${equipmentName}</h1>
            <h2>QR Code d'accès rapide</h2>
            
            <div class="qr-container">
              <img src="${baseUrl}/api/qr?hash=${qrCode.qr_code_hash}" alt="QR Code" style="width: 100%;" />
            </div>
            
            <p class="url">URL: ${qrUrl}</p>
            
            <div class="instructions">
              <p><strong>Instructions :</strong></p>
              <ol>
                <li>Imprimez ce QR code et fixez-le sur l'équipement.</li>
                <li>Scannez le QR code avec votre appareil mobile pour accéder rapidement aux informations détaillées.</li>
                <li>Ce code reste valide même après les mises à jour de l'application.</li>
              </ol>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Déclencher l'impression après chargement complet
    printWindow.addEventListener('load', function() {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        // Ne pas fermer la fenêtre pour permettre plusieurs impressions
      }, 300);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code d'accès rapide
        </h2>
        <p className="text-muted-foreground">
          Ce QR code permet d'accéder directement à cet équipement. Imprimez-le et fixez-le sur la machine.
        </p>
      </div>
      
      <Separator />
      
      {loading && (
        <div className="flex flex-col items-center justify-center p-8">
          <Skeleton className="w-64 h-64 rounded" />
          <Skeleton className="w-48 h-5 mt-4" />
          <div className="flex gap-2 mt-6">
            <Skeleton className="w-32 h-10" />
            <Skeleton className="w-32 h-10" />
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-destructive/30 bg-destructive/10">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <h3 className="text-lg font-medium mt-2">Erreur de chargement</h3>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
          <Button variant="outline" className="mt-4" onClick={loadQRCode}>
            Réessayer
          </Button>
        </div>
      )}
      
      {!loading && !error && qrCode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-sm" ref={qrCodeRef}>
                <QRCodeSVG 
                  value={qrUrl} 
                  size={250}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <p className="mt-4 text-sm text-muted-foreground break-all">
                URL: {qrUrl}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-6">
                <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger
                </Button>
                <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
                  <Printer className="h-4 w-4" />
                  Imprimer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsRegenerateDialogOpen(true)}
                  className="flex items-center gap-2 text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300 hover:bg-amber-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Régénérer
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-2">Instructions</h3>
                <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                  <li>Imprimez ce QR code et fixez-le sur l'équipement.</li>
                  <li>Scannez le QR code avec n'importe quel appareil mobile pour accéder directement aux détails de l'équipement.</li>
                  <li>Ce code QR reste valide même après les mises à jour de l'application.</li>
                  <li>Si le code est endommagé ou perdu, vous pouvez en générer un nouveau à tout moment.</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-2">Informations</h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">ID du QR Code:</span>
                    <span className="col-span-2 font-mono">{qrCode.id.substring(0, 8)}...</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Hash:</span>
                    <span className="col-span-2 font-mono">{qrCode.qr_code_hash}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-muted-foreground">Créé le:</span>
                    <span className="col-span-2">
                      {new Date(qrCode.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  {qrCode.last_scanned && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-muted-foreground">Dernier scan:</span>
                      <span className="col-span-2">
                        {new Date(qrCode.last_scanned).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {/* Dialogue de confirmation pour la régénération du QR code */}
      <AlertDialog open={isRegenerateDialogOpen} onOpenChange={setIsRegenerateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Régénérer le QR code ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va créer un nouveau QR code et désactiver l'ancien. Les anciens QR codes imprimés ou partagés ne fonctionneront plus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerateQRCode} className="bg-amber-600 hover:bg-amber-700">
              Régénérer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EquipmentQRCodeManager;
