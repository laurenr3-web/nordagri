
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

// Configurer les en-têtes CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Gestion des requêtes OPTIONS pour CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer les données d'invitation depuis la requête
    const { email, role, farmId } = await req.json();
    
    if (!email || !role || !farmId) {
      return new Response(
        JSON.stringify({ error: "Email, role et farmId sont requis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Récupérer les clés d'API depuis les variables d'environnement
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    // Créer un client Supabase avec le token d'autorisation
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // Vérifier que l'utilisateur est authentifié
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Créer un client admin pour accéder aux fonctions d'administration
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers, error: userQueryError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userQueryError) {
      return new Response(
        JSON.stringify({ error: "Erreur lors de la vérification de l'utilisateur" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const existingUser = existingUsers?.users.find(u => u.email === email);
    
    if (!existingUser) {
      return new Response(
        JSON.stringify({ error: "Utilisateur non trouvé. L'utilisateur doit créer un compte avant d'être invité." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }
    
    // Utiliser la fonction RPC pour ajouter l'utilisateur à la ferme
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "invite_user_to_farm",
      {
        email: email,
        farm_id: farmId,
        role: role,
      }
    );
    
    if (rpcError) {
      return new Response(
        JSON.stringify({ error: rpcError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Vérifier le résultat de l'invitation
    if (!rpcResult.success) {
      return new Response(
        JSON.stringify({ error: rpcResult.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Invitation envoyée avec succès" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
