import { supabase } from '@/integrations/supabase/client';

/**
 * Upload a photo to bucket point_photos at "{farm_id}/{point_id|tmp}/{filename}".
 * Returns the storage path (not a signed URL) — store in photo_urls.
 */
export async function uploadPointPhoto(
  file: File,
  farmId: string,
  pointId: string | null
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const folder = pointId ?? 'tmp';
  const path = `${farmId}/${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('point_photos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function getSignedPointPhotoUrl(path: string): Promise<string | null> {
  if (!path) return null;
  // If it's already a full URL (legacy), return as-is
  if (path.startsWith('http')) return path;
  const { data } = await supabase.storage.from('point_photos').createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}