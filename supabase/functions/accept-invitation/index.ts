
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.37.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invitationId } = await req.json();

    if (!invitationId) {
      return new Response(
        JSON.stringify({ success: false, error: "ID d'invitation requis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Non autorisé" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the invitation
    const { data: invitation, error: invError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (invError || !invitation) {
      return new Response(
        JSON.stringify({ success: false, error: "Invitation non trouvée" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Check invitation status
    if (invitation.status !== 'pending') {
      return new Response(
        JSON.stringify({ success: false, error: "Cette invitation a déjà été traitée" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check expiration
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: "Cette invitation a expiré" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify email matches
    if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Cette invitation est destinée à une autre adresse email" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Check if already a member
    const { data: existingMember } = await supabaseAdmin
      .from('farm_members')
      .select('id')
      .eq('farm_id', invitation.farm_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingMember) {
      // Already a member, just mark invitation as accepted
      await supabaseAdmin
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      return new Response(
        JSON.stringify({ success: true, message: "Vous êtes déjà membre de cette ferme" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Add user to farm_members
    const { error: memberError } = await supabaseAdmin
      .from('farm_members')
      .insert({
        user_id: user.id,
        farm_id: invitation.farm_id,
        role: invitation.role || 'member',
      });

    if (memberError) {
      console.error("Erreur ajout membre:", memberError);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur lors de l'ajout à la ferme" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Update profile farm_id
    await supabaseAdmin
      .from('profiles')
      .update({ farm_id: invitation.farm_id })
      .eq('id', user.id);

    // Mark invitation as accepted
    await supabaseAdmin
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation acceptée ! Vous avez rejoint la ferme.",
        farmId: invitation.farm_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Erreur interne du serveur" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
