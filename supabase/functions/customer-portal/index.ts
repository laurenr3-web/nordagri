
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json"
};

// Fonction auxiliaire pour la journalisation
function logInfo(message: string, data?: any) {
  const logData = data ? ` - ${JSON.stringify(data)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${message}${logData}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    logInfo("Démarrage de la fonction customer-portal");
    
    // Vérification des variables d'environnement
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Variables d'environnement Supabase manquantes");
    }
    
    if (!stripeSecretKey) {
      throw new Error("Clé Stripe manquante");
    }
    
    // Initialiser le client Supabase avec la clé de service pour contourner RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { 
      auth: { persistSession: false } 
    });
    
    // Initialiser Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16"
    });
    
    // Extraire le token d'authentification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Token d'authentification manquant");
    }
    
    const token = authHeader.replace("Bearer ", "");
    logInfo("Vérification du token d'authentification");
    
    // Obtenir l'utilisateur à partir du token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError) {
      throw new Error(`Erreur d'authentification: ${userError.message}`);
    }
    
    if (!user || !user.email) {
      throw new Error("Utilisateur non authentifié ou email manquant");
    }
    
    logInfo("Utilisateur authentifié", { userId: user.id, email: user.email });
    
    // Rechercher le client Stripe correspondant à cet email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });
    
    if (customers.data.length === 0) {
      throw new Error("Aucun client Stripe trouvé pour cet utilisateur");
    }
    
    const customerId = customers.data[0].id;
    logInfo("Client Stripe trouvé", { customerId });
    
    // Origine pour la redirection de retour
    const origin = req.headers.get("origin") || "http://localhost:3000";
    
    // Créer une session du portail client
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings?tab=subscription`,
    });
    
    logInfo("Session du portail client créée", { sessionId: session.id, url: session.url });
    
    // Renvoyer l'URL vers le portail client
    return new Response(JSON.stringify({ url: session.url }), { 
      headers: corsHeaders,
      status: 200
    });
  } catch (error: any) {
    console.error("[CUSTOMER-PORTAL] Erreur:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Une erreur s'est produite lors de l'accès au portail client" 
      }), { 
        headers: corsHeaders, 
        status: 500 
      }
    );
  }
});
