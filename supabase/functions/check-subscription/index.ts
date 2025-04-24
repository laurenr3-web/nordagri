
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
  console.log(`[CHECK-SUBSCRIPTION] ${message}${logData}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    logInfo("Démarrage de la fonction check-subscription");
    
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
    
    // Vérifier si l'utilisateur est un client Stripe
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });
    
    // Si l'utilisateur n'est pas un client Stripe, il est sur le plan gratuit
    if (customers.data.length === 0) {
      logInfo("Aucun client Stripe trouvé, attribution du plan gratuit");
      
      // Mettre à jour la table subscriptions dans Supabase
      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        email: user.email,
        plan: "free",
        stripe_customer_id: null,
        status: "free",
        active: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({
        plan: "free",
        status: "free",
        active: false
      }), { 
        headers: corsHeaders,
        status: 200
      });
    }
    
    const customerId = customers.data[0].id;
    logInfo("Client Stripe trouvé", { customerId });
    
    // Récupérer les abonnements actifs
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
      expand: ["data.default_payment_method"]
    });
    
    // Si aucun abonnement n'existe, l'utilisateur est sur le plan gratuit
    if (subscriptions.data.length === 0) {
      logInfo("Aucun abonnement trouvé, attribution du plan gratuit");
      
      // Mettre à jour la table subscriptions dans Supabase
      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        email: user.email,
        plan: "free",
        stripe_customer_id: customerId,
        status: "free",
        active: false,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({
        plan: "free",
        status: "free",
        active: false,
        stripe_customer_id: customerId
      }), { 
        headers: corsHeaders,
        status: 200
      });
    }
    
    // Récupérer les détails de l'abonnement
    const subscription = subscriptions.data[0];
    const status = subscription.status;
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const cancelAtPeriodEnd = subscription.cancel_at_period_end;
    
    // Déterminer le type de plan en fonction du prix
    let plan = "pro";
    
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      
      // Déterminer le plan en fonction du prix
      if (price.unit_amount) {
        if (price.unit_amount >= 9900) { // 99.99€
          plan = "enterprise";
        } else if (price.unit_amount >= 2900) { // 29.99€
          plan = "pro";
        }
      }
    }
    
    // Vérifier si l'abonnement est actif
    const active = ["active", "trialing", "past_due"].includes(status);
    
    logInfo("Détails de l'abonnement récupérés", { 
      plan, 
      status, 
      active, 
      currentPeriodEnd,
      cancelAtPeriodEnd 
    });
    
    // Mettre à jour la table subscriptions dans Supabase
    await supabase.from("subscriptions").upsert({
      user_id: user.id,
      email: user.email,
      plan,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status,
      active,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    
    // Renvoyer l'état de l'abonnement
    return new Response(JSON.stringify({
      plan,
      status,
      active,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id
    }), { 
      headers: corsHeaders,
      status: 200
    });
  } catch (error: any) {
    console.error("[CHECK-SUBSCRIPTION] Erreur:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || "Une erreur s'est produite lors de la vérification de l'abonnement" 
      }), { 
        headers: corsHeaders, 
        status: 500 
      }
    );
  }
});
