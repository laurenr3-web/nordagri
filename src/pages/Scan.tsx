import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft, Camera, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { qrCodeService } from '@/services/supabase/qrCodeService';

const READER_ID = 'qr-reader-region';

const Scan: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(true, '/scan');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [status, setStatus] = useState<'idle' | 'starting' | 'scanning' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const handledRef = useRef(false);

  const stop = async () => {
    try {
      if (scannerRef.current) {
        const state = scannerRef.current.getState();
        if (state === 2 /* SCANNING */) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (e) {
      // noop
    }
  };

  const handleDecoded = async (text: string) => {
    if (handledRef.current) return;
    handledRef.current = true;
    await stop();

    try {
      let target: string | null = null;

      // 1) Full URL with /scan/:hash
      const scanMatch = text.match(/\/scan\/([A-Za-z0-9_-]+)/);
      // 2) Full URL with /equipment/:id
      const equipmentMatch = text.match(/\/equipment\/(\d+)/);
      // 3) Full URL with /parts (just routes there)
      const partsMatch = text.match(/\/parts(?:\/(\d+))?/);

      if (scanMatch) {
        const hash = scanMatch[1];
        const found = await qrCodeService.getEquipmentByQRCodeHash(hash);
        if (found) {
          target = `/equipment/${found.equipment_id}`;
        } else {
          throw new Error('QR code invalide ou expiré');
        }
      } else if (equipmentMatch) {
        target = `/equipment/${equipmentMatch[1]}`;
      } else if (partsMatch) {
        target = partsMatch[1] ? `/parts?id=${partsMatch[1]}` : '/parts';
      } else if (/^[a-f0-9]{16,}$/i.test(text.trim())) {
        // Raw hash fallback
        const found = await qrCodeService.getEquipmentByQRCodeHash(text.trim());
        if (found) target = `/equipment/${found.equipment_id}`;
      }

      if (!target) {
        throw new Error('QR code non reconnu');
      }
      toast.success('QR code détecté');
      navigate(target, { replace: true });
    } catch (e: any) {
      handledRef.current = false;
      setStatus('error');
      setError(e?.message || 'QR code invalide');
      toast.error(e?.message || 'QR code invalide');
    }
  };

  const start = async () => {
    setError(null);
    setStatus('starting');
    try {
      const scanner = new Html5Qrcode(READER_ID, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          void handleDecoded(decodedText);
        },
        () => {
          // ignore per-frame decode errors
        }
      );
      setStatus('scanning');
    } catch (e: any) {
      console.error('Camera error', e);
      setStatus('error');
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      void start();
    }
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-2 p-3 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Retour">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold">Scanner un QR code</h1>
      </header>

      <main className="flex-1 flex flex-col items-center p-4 gap-4">
        <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-muted relative">
          <div id={READER_ID} className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />
          {status === 'starting' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Initialisation de la caméra…</p>
            </div>
          )}
        </div>

        {status === 'scanning' && (
          <p className="text-sm text-muted-foreground text-center">
            Pointez la caméra vers un QR code d'équipement ou de pièce.
          </p>
        )}

        {status === 'error' && (
          <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button onClick={start} size="sm">
              <Camera className="h-4 w-4 mr-2" /> Réessayer
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Scan;