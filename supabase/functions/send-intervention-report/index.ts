
// supabase/functions/send-intervention-report/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS pre-flight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Récupérer les informations d'environnement
    const SMTP_HOST = Deno.env.get("SMTP_HOST") || "";
    const SMTP_PORT = Number(Deno.env.get("SMTP_PORT")) || 587;
    const SMTP_USER = Deno.env.get("SMTP_USER") || "";
    const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD") || "";
    const SMTP_FROM = Deno.env.get("SMTP_FROM") || "nordagri@example.com";

    // Vérifier la présence des informations SMTP
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
      throw new Error("Configuration SMTP manquante");
    }

    // Récupérer les informations de la requête
    const { to, subject, message, pdfBase64, fileName, interventionId } = await req.json();

    // Vérification des données requises
    if (!to || !subject || !pdfBase64 || !fileName) {
      throw new Error("Données manquantes pour l'envoi de l'email");
    }

    // Convertir le PDF base64 en Uint8Array
    const pdfBytes = Uint8Array.from(atob(pdfBase64), (c) => c.charCodeAt(0));

    // Configurer le client SMTP
    const client = new SmtpClient();
    await client.connect({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USER,
      password: SMTP_PASSWORD,
      tls: true,
    });

    // Envoyer l'email
    await client.send({
      from: SMTP_FROM,
      to: to,
      subject: subject,
      content: message,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Rapport d'intervention</h2>
          <p>${message}</p>
          <p>Veuillez trouver ci-joint le rapport d'intervention au format PDF.</p>
          <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            Ce message a été envoyé automatiquement par NordAgri.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBytes,
          contentType: "application/pdf",
        },
      ],
    });

    // Fermer la connexion
    await client.close();

    // Mettre à jour la base de données pour marquer le rapport comme envoyé
    if (interventionId) {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
      );
      
      await supabaseClient.from("interventions").update({
        report_sent: true,
        report_sent_date: new Date().toISOString(),
        report_sent_to: to
      }).eq("id", interventionId);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Rapport envoyé avec succès" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
