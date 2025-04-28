
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Créer le client Supabase avec la clé de service
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier si le bucket field-observations existe déjà
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      throw bucketsError;
    }
    
    const bucketName = 'field-observations';
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    // Si le bucket n'existe pas, le créer
    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (createBucketError) {
        throw createBucketError;
      }
      
      console.log(`Bucket '${bucketName}' créé avec succès.`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: bucketExists ? `Le bucket '${bucketName}' existe déjà.` : `Le bucket '${bucketName}' a été créé.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
