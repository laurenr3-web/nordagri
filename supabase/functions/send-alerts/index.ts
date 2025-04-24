import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Constants
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER") ?? "";
const NOTIFICATIONS_API_KEY = Deno.env.get("NOTIFICATIONS_API_KEY") ?? "";

// Additional validation to ensure all required secrets are present
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.error("Missing Twilio configuration. Please check your environment variables.");
}

if (!NOTIFICATIONS_API_KEY) {
  console.error("Missing Notifications API Key. Please configure in Supabase secrets.");
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const resend = new Resend(RESEND_API_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(to: string, subject: string, htmlContent: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "NordAgri <notifications@nordagri.app>",
      to: [to],
      subject: subject,
      html: htmlContent,
    });
    
    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }
    
    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Exception when sending email:", error);
    return { success: false, error };
  }
}

async function sendSMS(to: string, message: string) {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error("Missing Twilio credentials");
      return { success: false, error: "Missing Twilio credentials" };
    }
    
    const twilioEndpoint = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append("To", to);
    formData.append("From", TWILIO_PHONE_NUMBER);
    formData.append("Body", message);
    
    const response = await fetch(twilioEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
      },
      body: formData.toString(),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Error sending SMS:", data);
      return { success: false, error: data };
    }
    
    console.log("SMS sent successfully:", data.sid);
    return { success: true, data };
  } catch (error) {
    console.error("Exception when sending SMS:", error);
    return { success: false, error };
  }
}

// Process low stock alerts
async function processLowStockAlerts() {
  try {
    // Get farms with low stock alerts enabled
    const { data: farms, error: farmsError } = await supabase
      .from("farms")
      .select("id, name, owner_id");
    
    if (farmsError) throw farmsError;
    
    for (const farm of farms) {
      // Get users in this farm
      const { data: farmUsers, error: usersError } = await supabase
        .from("profiles")
        .select(`
          id, 
          first_name,
          last_name,
          email
        `)
        .eq("farm_id", farm.id);
      
      if (usersError) {
        console.error("Error fetching farm users:", usersError);
        continue;
      }
      
      // Get notification settings for each user
      for (const user of farmUsers) {
        const { data: notificationSettings, error: settingsError } = await supabase
          .from("notification_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (settingsError || !notificationSettings) {
          console.error("Error fetching notification settings:", settingsError);
          continue;
        }
        
        // Skip if low stock alerts are disabled
        if (!notificationSettings.stock_low_enabled) continue;
        
        // Get low stock parts for this farm
        const { data: lowStockParts, error: partsError } = await supabase
          .from("parts_inventory")
          .select("id, name, quantity, reorder_threshold, category")
          .eq("farm_id", farm.id)
          .lte("quantity", supabase.rpc("coalesce", { value: "reorder_threshold", fallback: 5 }))
          .gt("quantity", 0);
        
        if (partsError) {
          console.error("Error fetching low stock parts:", partsError);
          continue;
        }
        
        if (!lowStockParts || lowStockParts.length === 0) {
          console.log("No low stock parts for farm:", farm.name);
          continue;
        }
        
        const userName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        
        // Format notification content
        const subject = `🔔 Alerte stock bas - ${lowStockParts.length} pièce(s) à réapprovisionner`;
        
        // HTML for email
        const emailContent = `
          <h2>Alerte stock bas - ${farm.name}</h2>
          <p>Bonjour ${userName},</p>
          <p>Les pièces suivantes ont atteint un niveau de stock critique :</p>
          <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
            <tr>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Quantité actuelle</th>
              <th>Seuil de réapprovisionnement</th>
            </tr>
            ${lowStockParts.map(part => `
              <tr>
                <td>${part.name}</td>
                <td>${part.category || "-"}</td>
                <td>${part.quantity}</td>
                <td>${part.reorder_threshold || 5}</td>
              </tr>
            `).join("")}
          </table>
          <p>Nous vous recommandons de réapprovisionner ces articles rapidement.</p>
          <p>Cordialement,<br>L'équipe NordAgri</p>
        `;
        
        // Text for SMS
        const smsContent = `NordAgri: Alerte stock bas - ${lowStockParts.length} pièce(s) à réapprovisionner dans ${farm.name}. Pièces: ${lowStockParts.slice(0, 3).map(p => p.name).join(", ")}${lowStockParts.length > 3 ? '...' : ''}`;
        
        // Send notifications based on user preferences
        if (notificationSettings.email_enabled && user.email) {
          await sendEmail(user.email, subject, emailContent);
        }
        
        if (notificationSettings.sms_enabled && notificationSettings.notification_preferences?.phone_number) {
          await sendSMS(notificationSettings.notification_preferences.phone_number, smsContent);
        }
      }
    }
    
    return { processed: true };
  } catch (error) {
    console.error("Error processing low stock alerts:", error);
    throw error;
  }
}

// Process maintenance reminders
async function processMaintenanceReminders() {
  try {
    const now = new Date();
    // Calculate date 7 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    
    // Format dates for query
    const targetDateStr = targetDate.toISOString().split("T")[0];
    
    // Get farms
    const { data: farms, error: farmsError } = await supabase
      .from("farms")
      .select("id, name");
    
    if (farmsError) throw farmsError;
    
    for (const farm of farms) {
      // Get maintenance tasks due in the next 7 days
      const { data: upcomingTasks, error: tasksError } = await supabase
        .from("maintenance_plans")
        .select(`
          id,
          title,
          description,
          next_due_date,
          equipment_name,
          assigned_to,
          created_by
        `)
        .eq("active", true)
        .gte("next_due_date", now.toISOString())
        .lte("next_due_date", targetDateStr + "T23:59:59.999Z");
      
      if (tasksError) {
        console.error("Error fetching upcoming tasks:", tasksError);
        continue;
      }
      
      if (!upcomingTasks || upcomingTasks.length === 0) {
        console.log("No upcoming maintenance tasks for farm:", farm.name);
        continue;
      }
      
      // Get users in this farm
      const { data: farmUsers, error: usersError } = await supabase
        .from("profiles")
        .select(`
          id, 
          first_name,
          last_name,
          email
        `)
        .eq("farm_id", farm.id);
      
      if (usersError) {
        console.error("Error fetching farm users:", usersError);
        continue;
      }
      
      // Get notification settings for each user
      for (const user of farmUsers) {
        const { data: notificationSettings, error: settingsError } = await supabase
          .from("notification_settings")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (settingsError || !notificationSettings) {
          console.error("Error fetching notification settings:", settingsError);
          continue;
        }
        
        // Skip if maintenance reminders are disabled
        if (!notificationSettings.maintenance_reminder_enabled) continue;
        
        const userName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
        
        // Format notification content
        const subject = `🔧 Rappel maintenance - ${upcomingTasks.length} tâche(s) à venir`;
        
        // HTML for email
        const emailContent = `
          <h2>Rappel de maintenance planifiée - ${farm.name}</h2>
          <p>Bonjour ${userName},</p>
          <p>Nous vous rappelons que les tâches de maintenance suivantes sont prévues dans les 7 prochains jours :</p>
          <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
            <tr>
              <th>Titre</th>
              <th>Équipement</th>
              <th>Date prévue</th>
              <th>Description</th>
            </tr>
            ${upcomingTasks.map(task => {
              const dueDate = new Date(task.next_due_date);
              return `
                <tr>
                  <td>${task.title}</td>
                  <td>${task.equipment_name || "-"}</td>
                  <td>${dueDate.toLocaleDateString("fr-FR")}</td>
                  <td>${task.description || "-"}</td>
                </tr>
              `;
            }).join("")}
          </table>
          <p>Veuillez planifier ces interventions dans votre agenda.</p>
          <p>Cordialement,<br>L'équipe NordAgri</p>
        `;
        
        // Text for SMS
        const smsContent = `NordAgri: Rappel maintenance - ${upcomingTasks.length} tâche(s) à effectuer dans les 7 prochains jours: ${upcomingTasks.slice(0, 2).map(t => t.title).join(", ")}${upcomingTasks.length > 2 ? '...' : ''}`;
        
        // Send notifications based on user preferences
        if (notificationSettings.email_enabled && user.email) {
          await sendEmail(user.email, subject, emailContent);
        }
        
        if (notificationSettings.sms_enabled && notificationSettings.notification_preferences?.phone_number) {
          await sendSMS(notificationSettings.notification_preferences.phone_number, smsContent);
        }
      }
    }
    
    return { processed: true };
  } catch (error) {
    console.error("Error processing maintenance reminders:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the notification type from query parameters
    const url = new URL(req.url);
    const notificationType = url.searchParams.get("type");
    
    // Check authorization - simple API key for now
    // In production, implement better authentication
    const authorization = req.headers.get("authorization");
    const apiKey = authorization?.replace("Bearer ", "");
    
    // Verify API key (This is a simple check - use a more secure method in production)
    if (apiKey !== Deno.env.get("NOTIFICATIONS_API_KEY")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid API key" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Process based on notification type
    let result;
    
    switch (notificationType) {
      case "low_stock":
        result = await processLowStockAlerts();
        break;
      case "maintenance":
        result = await processMaintenanceReminders();
        break;
      default:
        // If no specific type is provided, run all checks
        const lowStock = await processLowStockAlerts();
        const maintenance = await processMaintenanceReminders();
        result = {
          low_stock: lowStock,
          maintenance: maintenance
        };
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        result
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error processing notifications:", error);
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
