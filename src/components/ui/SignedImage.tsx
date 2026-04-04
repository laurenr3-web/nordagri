import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { equipmentMultiPhotoService } from '@/services/supabase/equipmentMultiPhotoService';

interface SignedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  storagePath: string;
  fallback?: React.ReactNode;
}

/**
 * Image component that resolves signed URLs from storage paths.
 * Handles both legacy public URLs and new storage paths.
 */
const SignedImage: React.FC<SignedImageProps> = ({ storagePath, fallback, alt, ...imgProps }) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (!storagePath) return;
      
      // If it's an external URL (not from our storage), use directly
      if (storagePath.startsWith('http') && !storagePath.includes('equipment_photos')) {
        setSignedUrl(storagePath);
        return;
      }

      try {
        const url = await equipmentMultiPhotoService.getSignedUrl(storagePath);
        if (!cancelled && url) {
          setSignedUrl(url);
        } else if (!cancelled) {
          setError(true);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [storagePath]);

  if (error || !signedUrl) {
    return fallback ? <>{fallback}</> : null;
  }

  return <img src={signedUrl} alt={alt} {...imgProps} />;
};

export default SignedImage;
