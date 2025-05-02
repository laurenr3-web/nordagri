
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
        JSON.stringify({ 
          success: false, 
          error: "Email, role et farmId sont requis" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Vérifier que le rôle est valide
    if (!["viewer", "editor", "admin"].includes(role)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Rôle invalide. Les rôles autorisés sont: viewer, editor, admin" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Récupérer les clés d'API depuis les variables d'environnement
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Variables d'environnement manquantes");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Configuration serveur incorrecte" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

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
        JSON.stringify({ 
          success: false, 
          error: "Non autorisé" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Créer un client admin pour accéder aux fonctions d'administration
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Vérifier si l'utilisateur a les droits pour inviter (owner ou admin)
    const { data: userRoleData, error: userRoleError } = await supabase
      .from('farm_members')
      .select('role')
      .eq('farm_id', farmId)
      .eq('user_id', user.id)
      .single();
      
    if (userRoleError) {
      console.error("Erreur lors de la vérification du rôle:", userRoleError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Erreur lors de la vérification de vos droits d'accès" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    if (!userRoleData) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Vous n'avez pas accès à cette ferme" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }
    
    if (!["owner", "admin"].includes(userRoleData.role)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Seuls les administrateurs et propriétaires peuvent inviter des utilisateurs" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }
    
    // Vérifier si l'utilisateur existe déjà
    const { data: existingUsers, error: userQueryError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userQueryError) {
      console.error("Erreur lors de la vérification de l'utilisateur:", userQueryError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Erreur lors de la vérification de l'utilisateur" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const existingUser = existingUsers?.users.find(u => u.email === email);
    const userId = existingUser?.id;
    
    // Si l'utilisateur existe, vérifier s'il est déjà membre de cette ferme
    if (userId) {
      const { data: existingMember, error: memberError } = await supabase
        .from('farm_members')
        .select('*')
        .eq('farm_id', farmId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (memberError) {
        console.error("Erreur lors de la vérification des membres existants:", memberError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Erreur lors de la vérification des membres existants" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      if (existingMember) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Cet utilisateur est déjà membre de cette ferme" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }
    
    // Créer une invitation dans la table invitations
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .insert({
        email: email,
        farm_id: farmId,
        role: role,
        invited_by: user.id,
        status: 'pending'
      })
      .select()
      .single();
    
    if (invitationError) {
      // Vérifier si l'erreur est due à une invitation déjà existante
      if (invitationError.message.includes('duplicate key value violates unique constraint')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Une invitation a déjà été envoyée à cet email pour cette ferme" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      console.error("Erreur lors de la création de l'invitation:", invitationError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Erreur lors de la création de l'invitation" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    if (!invitation) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Échec de la création de l'invitation" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Si l'utilisateur existe déjà, on peut directement l'ajouter à la ferme
    if (existingUser && userId) {
      // Ajouter l'utilisateur à la ferme
      const { error: addMemberError } = await supabase
        .from('farm_members')
        .insert({
          user_id: userId,
          farm_id: farmId,
          role: role,
          created_by: user.id
        });
      
      if (addMemberError) {
        console.error("Erreur lors de l'ajout de l'utilisateur à la ferme:", addMemberError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Erreur lors de l'ajout de l'utilisateur à la ferme" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      // Mettre à jour le statut de l'invitation
      await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);
    }
    
    // TODO: Envoyer un email d'invitation si nécessaire (à implémenter avec un service d'email)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation envoyée avec succès",
        data: {
          invitation_id: invitation.id,
          user_exists: !!existingUser
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erreur non gérée:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Une erreur inattendue s'est produite" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
