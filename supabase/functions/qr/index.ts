
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0';
import QRCode from 'https://esm.sh/qrcode@1.5.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

async function handleQRCodeRequest(req: Request) {
  const url = new URL(req.url);
  const hash = url.searchParams.get('hash');
  
  if (!hash) {
    return new Response(JSON.stringify({ error: 'QR code hash is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    // Construire l'URL complète
    const baseUrl = url.origin;
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
    
    // Extraire uniquement les données de l'image (retirer la partie "data:image/png;base64,")
    const imageData = qrImage.split(',')[1];
    const binaryData = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
    
    // Renvoyer l'image PNG
    return new Response(binaryData, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate QR code' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  return handleQRCodeRequest(req);
});
