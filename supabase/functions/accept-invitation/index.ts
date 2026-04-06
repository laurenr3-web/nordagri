
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Veuillez vous connecter pour accepter cette invitation." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");

    // Validate JWT — try getUser first, fallback to token decode
    let userId: string;
    let userEmail: string | undefined;

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      // Check if this is a "user_not_found" error (stale JWT from deleted/recreated user)
      const errorCode = (userError as any)?.code;
      console.error("Auth error:", userError);

      if (errorCode === 'user_not_found') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Votre session a expiré ou votre compte n'a pas été trouvé. Veuillez vous reconnecter.",
            code: "session_expired"
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Session invalide. Veuillez vous reconnecter.",
          code: "session_invalid"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    userId = user.id;
    userEmail = user.email;

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

    if (invitation.status !== 'pending') {
      return new Response(
        JSON.stringify({ success: false, error: "Cette invitation a déjà été traitée" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: "Cette invitation a expiré" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify email matches
    if (userEmail?.toLowerCase() !== invitation.email.toLowerCase()) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Cette invitation est destinée à une autre adresse email" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Ensure profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile) {
      console.log("Creating profile for new user:", userId);
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          first_name: user.user_metadata?.first_name || null,
          last_name: user.user_metadata?.last_name || null,
          farm_id: invitation.farm_id,
        });
    }

    // Check if already a member
    const { data: existingMember } = await supabaseAdmin
      .from('farm_members')
      .select('id')
      .eq('farm_id', invitation.farm_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      await supabaseAdmin
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      await supabaseAdmin
        .from('profiles')
        .update({ farm_id: invitation.farm_id })
        .eq('id', userId);

      return new Response(
        JSON.stringify({ success: true, message: "Vous êtes déjà membre de cette ferme" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Add user to farm_members
    const { error: memberError } = await supabaseAdmin
      .from('farm_members')
      .insert({
        user_id: userId,
        farm_id: invitation.farm_id,
        role: invitation.role || 'member',
      });

    if (memberError) {
      console.error("Erreur ajout membre:", memberError);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur lors de l'ajout à la ferme: " + memberError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Update profile farm_id
    await supabaseAdmin
      .from('profiles')
      .update({ farm_id: invitation.farm_id })
      .eq('id', userId);

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
