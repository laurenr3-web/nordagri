
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertTriangle, QrCode } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { useQrCodeVerification } from '@/hooks/equipment/useQrCodeVerification';
import { toast } from 'sonner';

/**
 * Composant pour la redirection après scan d'un QR code
 * - Vérifie l'authentification
 * - Valide le QR code
 * - Redirige vers la page de détail de l'équipement correspondant
 */
const ScanRedirect: React.FC = () => {
  const { id: qrCodeHash } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Auth state
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  
  // QR code verification
  const { verifyQrCode, isLoading: qrVerificationLoading, error: qrVerificationError } = useQrCodeVerification();
  
  // Component state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Handle authentication check
    if (!authLoading && !isAuthenticated) {
      const currentPath = location.pathname;
      navigate(`/auth?returnTo=${encodeURIComponent(currentPath)}`, { replace: true });
      return;
    }

    // Process QR code once authenticated
    const processQrCode = async () => {
      if (!qrCodeHash || !isAuthenticated) return;
      
      try {
        setIsLoading(true);
        toast.info("Vérification du QR code...");
        
        // Verify QR code
        const { isValid, equipmentId } = await verifyQrCode(qrCodeHash);
        
        if (isValid && equipmentId) {
          toast.success("Équipement trouvé, redirection...");
          navigate(`/equipment/${equipmentId}`, { replace: true });
        } else {
          setError(qrVerificationError || "QR code invalide");
          toast.error("QR code invalide");
        }
      } catch (err: any) {
        console.error('Erreur de redirection:', err);
        setError(err.message || "Une erreur s'est produite");
        toast.error("Erreur de redirection");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && !authLoading) {
      processQrCode();
    }
  }, [qrCodeHash, navigate, isAuthenticated, authLoading, verifyQrCode, qrVerificationError, location.pathname]);

  // Show loading state
  if (authLoading || isLoading || qrVerificationLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Vérification en cours...</p>
      </div>
    );
  }

  // Show error state
  if (error || qrVerificationError) {
    const errorMessage = error || qrVerificationError;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-destructive/10 p-6 rounded-lg text-center max-w-md">
          <div className="flex items-center justify-center mb-4">
            <QrCode className="h-12 w-12 text-destructive" />
            <AlertTriangle className="h-12 w-12 text-destructive ml-2" />
          </div>
          <h1 className="text-2xl font-bold">QR Code non valide</h1>
          <p className="mt-2 text-muted-foreground">{errorMessage}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/equipment')}>
              Voir tous les équipements
            </Button>
            <Button variant="outline" onClick={() => {
              setError(null);
              setIsLoading(true);
              window.location.reload();
            }}>
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default return (should not be displayed as we navigate away)
  return null;
};

export default ScanRedirect;
