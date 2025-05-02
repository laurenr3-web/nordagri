
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
    
    console.log("Fonction Edge invoquée avec:", { email, role, farmId });
    
    if (!email || !role || !farmId) {
      console.error("Données d'invitation incomplètes:", { email, role, farmId });
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
      console.error("Rôle invalide:", role);
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

    console.log("Variables d'environnement récupérées avec succès");

    // Créer un client Supabase avec le token d'autorisation
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    console.log("Client Supabase créé");

    // Vérifier que l'utilisateur est authentifié
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error("Erreur lors de la récupération de l'utilisateur:", authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Non autorisé" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    if (!user) {
      console.error("Aucun utilisateur authentifié trouvé");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Utilisateur non authentifié" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    console.log("Utilisateur authentifié:", user.id);

    // Créer un client admin pour accéder aux fonctions d'administration
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Client Supabase Admin créé");

    // Vérifier si l'utilisateur a les droits sur la ferme (owner ou admin)
    // Note: Nous allons simplifier cette partie pour déboguer
    try {
      // Commencer par vérifier si la table farm_members existe
      const { error: tableCheckError } = await supabase
        .from('farm_members')
        .select('count')
        .limit(1);
      
      if (tableCheckError) {
        console.error("Erreur lors de la vérification de la table farm_members:", tableCheckError);
        
        // Si la table n'existe pas, nous pouvons vérifier avec les profils et farms
        console.log("Vérification alternative des droits via la table profiles...");
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('farm_id')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          console.error("Erreur lors de la vérification du profil:", profileError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Erreur lors de la vérification de vos droits d'accès" 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
        
        // Si l'utilisateur est propriétaire de cette ferme, nous lui accordons l'accès
        if (profileData?.farm_id === farmId) {
          console.log("L'utilisateur est propriétaire de la ferme. Autorisation accordée.");
          // Continuer avec l'invitation, pas besoin de vérifier le rôle
        } else {
          console.error("L'utilisateur n'a pas accès à cette ferme");
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Vous n'avez pas accès à cette ferme" 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
          );
        }
      } else {
        // Si la table existe, vérifier le rôle normalement
        console.log("Vérification des droits via la table farm_members...");
        
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
          console.error("Aucun rôle trouvé pour l'utilisateur sur cette ferme");
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Vous n'avez pas accès à cette ferme" 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
          );
        }
        
        if (!["owner", "admin"].includes(userRoleData.role)) {
          console.error("Rôle insuffisant:", userRoleData.role);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Seuls les administrateurs et propriétaires peuvent inviter des utilisateurs" 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
          );
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des droits:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Erreur lors de la vérification de vos droits d'accès" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    console.log("Vérification des droits réussie");
    
    // Vérifier si l'utilisateur existe déjà
    let userId = null;
    let existingUser = null;
    
    try {
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
      
      existingUser = existingUsers?.users.find(u => u.email === email);
      userId = existingUser?.id;
      
      console.log("Vérification de l'utilisateur existant:", { exists: !!existingUser, userId });
    } catch (error) {
      console.error("Erreur lors de la recherche de l'utilisateur:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Erreur lors de la recherche de l'utilisateur" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Vérifier si des invitations existent déjà pour cet email et cette ferme
    try {
      console.log("Vérification des invitations existantes pour:", { email, farmId });
      
      const { data: existingInvitations, error: invitationCheckError } = await supabase
        .from('invitations')
        .select('*')
        .eq('email', email)
        .eq('farm_id', farmId)
        .eq('status', 'pending');
        
      if (invitationCheckError) {
        console.error("Erreur lors de la vérification des invitations:", invitationCheckError);
        // On continue malgré l'erreur
      } else if (existingInvitations && existingInvitations.length > 0) {
        console.log("Invitation existante trouvée:", existingInvitations[0]);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Une invitation est déjà en attente pour cet utilisateur" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des invitations existantes:", error);
      // On continue malgré l'erreur
    }
    
    // Si l'utilisateur existe, vérifier s'il est déjà membre de cette ferme
    try {
      if (userId) {
        console.log("Vérification si l'utilisateur est déjà membre de la ferme");
        
        // Vérifier d'abord si la table farm_members existe
        const { error: tableCheckError } = await supabase
          .from('farm_members')
          .select('count')
          .limit(1);
          
        if (!tableCheckError) {
          // La table existe, on vérifie si l'utilisateur est membre
          const { data: existingMember, error: memberError } = await supabase
            .from('farm_members')
            .select('*')
            .eq('farm_id', farmId)
            .eq('user_id', userId)
            .maybeSingle();
          
          if (memberError && memberError.code !== 'PGRST116') {
            console.error("Erreur lors de la vérification des membres existants:", memberError);
          } else if (existingMember) {
            console.log("L'utilisateur est déjà membre de cette ferme");
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: "Cet utilisateur est déjà membre de cette ferme" 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
          }
        } else {
          console.log("La table farm_members n'existe pas, vérification alternative...");
          
          // Vérifier via le champ farm_id dans la table profiles
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('farm_id')
            .eq('id', userId)
            .single();
            
          if (!profileError && profileData?.farm_id === farmId) {
            console.log("L'utilisateur est déjà associé à cette ferme via son profil");
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: "Cet utilisateur est déjà membre de cette ferme" 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
            );
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des membres existants:", error);
      // On continue malgré l'erreur
    }
    
    console.log("Aucun membre existant ou erreur de vérification, poursuite du processus");
    
    // Vérifier si la table invitations existe
    let invitation;
    try {
      console.log("Tentative de création d'une invitation");
      
      const { data: tableInvitation, error: tableError } = await supabase
        .from('invitations')
        .select('*')
        .limit(1);
        
      if (tableError && tableError.code === 'PGRST116') {
        console.error("La table 'invitations' n'existe pas");
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "La table 'invitations' n'existe pas dans la base de données" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      // Créer une invitation dans la table invitations
      const { data: newInvitation, error: invitationError } = await supabase
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
        console.error("Erreur lors de la création de l'invitation:", invitationError);
        
        // Vérifier si l'erreur est due à une contrainte unique
        if (invitationError.message && invitationError.message.includes('duplicate key value violates unique constraint')) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "Une invitation a déjà été envoyée à cet email pour cette ferme" 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        
        throw invitationError;
      }
      
      if (!newInvitation) {
        console.error("Échec de la création de l'invitation (aucune donnée retournée)");
        throw new Error("Échec de la création de l'invitation");
      }
      
      invitation = newInvitation;
      console.log("Invitation créée avec succès:", invitation);
    } catch (error) {
      console.error("Erreur lors de la création de l'invitation:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Erreur lors de la création de l'invitation: " + (error.message || "Erreur inconnue") 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Si l'utilisateur existe déjà, on peut directement l'ajouter à la ferme
    if (existingUser && userId) {
      try {
        console.log("Ajout direct de l'utilisateur existant à la ferme");
        
        // Vérifier d'abord si la table farm_members existe
        const { error: tableCheckError } = await supabase
          .from('farm_members')
          .select('count')
          .limit(1);
          
        if (tableCheckError) {
          console.log("La table farm_members n'existe pas, mise à jour du profil...");
          
          // Si farm_members n'existe pas, mettre à jour le champ farm_id dans le profil
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ farm_id: farmId })
            .eq('id', userId);
            
          if (updateError) {
            console.error("Erreur lors de la mise à jour du profil:", updateError);
          } else {
            console.log("Profil mis à jour avec succès pour l'utilisateur existant");
            
            // Mettre à jour le statut de l'invitation
            if (invitation) {
              await supabase
                .from('invitations')
                .update({ status: 'accepted' })
                .eq('id', invitation.id);
                
              console.log("Statut de l'invitation mis à jour: accepted");
            }
          }
        } else {
          // Si la table farm_members existe
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
          } else {
            console.log("Utilisateur ajouté avec succès à la ferme via farm_members");
            
            // Mettre à jour le statut de l'invitation
            if (invitation) {
              await supabase
                .from('invitations')
                .update({ status: 'accepted' })
                .eq('id', invitation.id);
                
              console.log("Statut de l'invitation mis à jour: accepted");
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'utilisateur à la ferme:", error);
        // On continue malgré l'erreur
      }
    }
    
    console.log("Processus d'invitation terminé avec succès");
    
    // TODO: Envoyer un email d'invitation si nécessaire (à implémenter avec un service d'email)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation envoyée avec succès",
        data: {
          invitation_id: invitation?.id,
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
