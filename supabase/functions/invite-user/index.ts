
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
    const { email, role, farmId } = await req.json();

    if (!email || !role || !farmId) {
      return new Response(
        JSON.stringify({ success: false, error: "Email, role et farmId sont requis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!["viewer", "editor", "admin"].includes(role)) {
      return new Response(
        JSON.stringify({ success: false, error: "Rôle invalide" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Non autorisé" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify authenticated user via getClaims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: "Non autorisé" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const user = { id: claimsData.claims.sub as string, email: claimsData.claims.email as string };

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is farm owner or admin
    const { data: farm } = await supabaseAdmin
      .from('farms')
      .select('id, owner_id, name')
      .eq('id', farmId)
      .single();

    if (!farm) {
      return new Response(
        JSON.stringify({ success: false, error: "Ferme non trouvée" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const isOwner = farm.owner_id === user.id;

    if (!isOwner) {
      // Check farm_members for admin role
      const { data: memberRole } = await supabaseAdmin
        .from('farm_members')
        .select('role')
        .eq('farm_id', farmId)
        .eq('user_id', user.id)
        .single();

      if (!memberRole || !["owner", "admin"].includes(memberRole.role)) {
        return new Response(
          JSON.stringify({ success: false, error: "Seuls les administrateurs peuvent inviter" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
    }

    // Check for existing pending invitation
    const { data: existingInvitations } = await supabaseAdmin
      .from('invitations')
      .select('id')
      .eq('email', email)
      .eq('farm_id', farmId)
      .eq('status', 'pending');

    if (existingInvitations && existingInvitations.length > 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Une invitation est déjà en attente pour cet utilisateur" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === email);

    // If user exists, check if already a member
    if (existingUser) {
      const { data: existingMember } = await supabaseAdmin
        .from('farm_members')
        .select('id')
        .eq('farm_id', farmId)
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (existingMember) {
        return new Response(
          JSON.stringify({ success: false, error: "Cet utilisateur est déjà membre de cette ferme" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    // Create the invitation with expiry (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email,
        farm_id: farmId,
        role,
        invited_by: user.id,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (invitationError || !invitation) {
      console.error("Erreur création invitation:", invitationError);
      return new Response(
        JSON.stringify({ success: false, error: "Erreur lors de la création de l'invitation" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Invitation stays pending — user must accept via the link

    // Send invitation email via transactional email system
    try {
      const emailPayload = {
        templateName: 'farm-invitation',
        recipientEmail: email,
        idempotencyKey: `farm-invite-${invitation.id}`,
        templateData: {
          farmName: farm.name,
          role,
          invitationId: invitation.id,
          inviterName: user.email,
        },
      };

      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify(emailPayload),
      });

      if (!emailResponse.ok) {
        const errBody = await emailResponse.text();
        console.error("Email send failed:", emailResponse.status, errBody);
      } else {
        console.log("Invitation email enqueued for", email);
      }
    } catch (emailError) {
      console.log("Email non envoyé:", emailError);
      // Continue - email is best-effort
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: existingUser ? "Utilisateur ajouté à la ferme" : "Invitation envoyée",
        data: {
          invitation_id: invitation.id,
          user_exists: !!existingUser,
        },
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
