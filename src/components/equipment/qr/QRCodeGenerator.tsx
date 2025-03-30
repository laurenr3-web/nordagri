
import React, { useState, useRef } from 'react';
import { QRCode } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Download, Printer, QrCode, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  equipmentId: string | number;
  equipmentName: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ equipmentId, equipmentName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // Construire l'URL complète pour le QR code
  const baseUrl = window.location.origin;
  const qrUrl = `${baseUrl}/scan/${equipmentId}`;

  const handleDownload = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcode-equipment-${equipmentId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR Code téléchargé avec succès');
  };

  const handlePrint = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Impossible d\'ouvrir la fenêtre d\'impression');
      return;
    }

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
            img {
              max-width: 300px;
              margin: 20px auto;
            }
            h2 {
              margin-bottom: 5px;
            }
            p {
              color: #666;
              margin-bottom: 30px;
            }
          </style>
        </head>
        <body>
          <h2>${equipmentName}</h2>
          <p>Scanner ce QR code pour accéder aux détails de l'équipement</p>
          <img src="${url}" alt="QR Code" />
          <p>URL: ${qrUrl}</p>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Déclencher l'impression après chargement complet
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
    };
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code pour ${equipmentName}`,
          text: `Scanner ce QR code pour accéder aux détails de l'équipement: ${equipmentName}`,
          url: qrUrl,
        });
        toast.success('QR Code partagé avec succès');
      } catch (error) {
        console.error('Erreur lors du partage:', error);
        toast.error('Erreur lors du partage du QR Code');
      }
    } else {
      // Copier l'URL si le partage n'est pas pris en charge
      navigator.clipboard.writeText(qrUrl);
      toast.success('URL copiée dans le presse-papier');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex gap-2 items-center"
        onClick={() => setIsOpen(true)}
      >
        <QrCode className="h-4 w-4" />
        <span>QR Code</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code pour {equipmentName}</DialogTitle>
            <DialogDescription>
              Imprimez ou téléchargez ce QR code et collez-le sur votre équipement pour un accès rapide
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center p-4">
            <Card className="p-4 border-2 border-primary/10" ref={qrCodeRef}>
              <QRCode 
                value={qrUrl} 
                size={200}
                level="H"
                includeMargin
                renderAs="canvas"
              />
            </Card>
            
            <p className="mt-2 text-sm text-muted-foreground">
              URL: {qrUrl}
            </p>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QRCodeGenerator;
