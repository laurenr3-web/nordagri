
import QRCode from 'qrcode';

/**
 * Génère une image QR code à partir d'un hash
 */
export async function generateQRCodeImage(hash: string): Promise<{ image: string; contentType: string }> {
  try {
    // Construire l'URL complète
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.agri-erp-insight.com';
    const qrUrl = `${baseUrl}/scan/${hash}`;
    
    // Options de génération du QR code
    const opts = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      width: 500,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };
    
    // Générer l'image QR code en Base64
    const qrImage = await QRCode.toDataURL(qrUrl, opts);
    
    // Retourner l'image et le type de contenu
    return {
      image: qrImage,
      contentType: 'image/png'
    };
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    throw error;
  }
}
