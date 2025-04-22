
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Constants
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Response helper
function createResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

// Service client for admin operations
const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Function to send email via external service
async function sendEmail(data: EmailData) {
  try {
    // This is a placeholder function - in a production environment,
    // you would integrate with an email service like SendGrid, AWS SES, etc.
    console.log("Sending email:", data);
    
    // In a real implementation we would call the email service API here
    // For now we're just logging and returning a mock success
    return { success: true, id: `email_${Date.now()}` };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

// Function to send SMS via external service
async function sendSMS(phoneNumber: string, message: string) {
  try {
    // This is a placeholder function - in a production environment,
    // you would integrate with an SMS service like Twilio, etc.
    console.log(`Sending SMS to ${phoneNumber}: ${message}`);
    
    // In a real implementation we would call the SMS service API here
    // For now we're just logging and returning a mock success
    return { success: true, id: `sms_${Date.now()}` };
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}

// Check for low stock parts
async function checkLowStockParts() {
  try {
    // Fetch parts with quantity <= reorder_threshold
    const { data: lowStockParts, error } = await serviceClient
      .from("parts_inventory")
      .select(`
        id, 
        name, 
        quantity, 
        reorder_threshold, 
        farm_id,
        category
      `)
      .lte("quantity", serviceClient.rpc("coalesce", { value: "reorder_threshold", fallback: 5 }))
      .gt("quantity", 0); // Exclude out of stock items (they likely already received notification)
    
    if (error) throw error;
    
    // Group parts by farm_id to send one email per farm
    const partsByFarm = lowStockParts?.reduce((acc, part) => {
      const farmId = part.farm_id?.toString() || "unknown";
      if (!acc[farmId]) acc[farmId] = [];
      acc[farmId].push(part);
      return acc;
    }, {} as Record<string, typeof lowStockParts>);
    
    // For each farm, find admin users and send them emails
    for (const [farmId, parts] of Object.entries(partsByFarm)) {
      if (!parts || parts.length === 0) continue;
      
      // Find farm details
      const { data: farm } = await serviceClient
        .from("farms")
        .select("name, owner_id, email")
        .eq("id", farmId)
        .single();
      
      if (!farm) continue;
      
      // Find admin email addresses for this farm
      const { data: users } = await serviceClient
        .from("profiles")
        .select(`
          id, 
          first_name,
          last_name,
          email,
          phone
        `)
        .eq("farm_id", farmId);
      
      // Filter to admin user (farm owner)
      const adminUser = users?.find(user => user.id === farm.owner_id);
      if (!adminUser) continue;
      
      // Send notification email to farm admin
      const farmName = farm.name || "Votre ferme";
      const adminName = `${adminUser.first_name || ""} ${adminUser.last_name || ""}`.trim();
      
      // Prepare email content
      const emailContent = `
        <h2>Alerte stock bas - ${farmName}</h2>
        <p>Bonjour ${adminName || ""},</p>
        <p>Les pièces suivantes ont atteint un niveau de stock critique :</p>
        <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
          <tr>
            <th>Nom</th>
            <th>Catégorie</th>
            <th>Quantité actuelle</th>
            <th>Seuil de réapprovisionnement</th>
          </tr>
          ${parts.map(part => `
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
      
      // Get recipient email - use farm email as fallback
      const recipientEmail = adminUser.email || farm.email;
      if (recipientEmail) {
        await sendEmail({
          to: recipientEmail,
          subject: `Alerte stock bas - ${parts.length} pièce(s) à réapprovisionner`,
          html: emailContent
        });
      }
    }
    
    return { processed: Object.values(partsByFarm || {}).flat().length };
  } catch (error) {
    console.error("Error checking low stock parts:", error);
    throw error;
  }
}

// Check for upcoming maintenance tasks
async function checkUpcomingMaintenance() {
  try {
    const now = new Date();
    // Calculate date 7 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    
    // Format dates for query
    const targetDateStr = targetDate.toISOString().split("T")[0];
    
    // Get maintenance tasks due in 7 days
    const { data: upcomingTasks, error } = await serviceClient
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
    
    if (error) throw error;
    
    // For each task, notify assigned person and task creator
    for (const task of upcomingTasks || []) {
      // Format due date
      const dueDate = new Date(task.next_due_date);
      const formattedDueDate = dueDate.toLocaleDateString("fr-FR");
      
      // Find user email and notification preferences
      // First check assigned user
      if (task.assigned_to) {
        const { data: assignedUser } = await serviceClient
          .from("profiles")
          .select(`
            id, 
            first_name,
            last_name,
            email,
            phone
          `)
          .eq("id", task.assigned_to)
          .single();
        
        if (assignedUser) {
          // Get user notification preferences
          const { data: notificationSettings } = await serviceClient
            .from("notification_settings")
            .select("email_notifications, sms_notifications, push_notifications")
            .eq("user_id", assignedUser.id)
            .single();
          
          const name = `${assignedUser.first_name || ""} ${assignedUser.last_name || ""}`.trim();
          
          // Prepare notification content
          const subject = `Rappel maintenance: ${task.title} - dû le ${formattedDueDate}`;
          
          const emailBody = `
            <h2>Rappel de maintenance planifiée</h2>
            <p>Bonjour ${name || ""},</p>
            <p>Nous vous rappelons qu'une tâche de maintenance est prévue dans 7 jours :</p>
            <table border="0" cellpadding="5">
              <tr>
                <td><strong>Titre :</strong></td>
                <td>${task.title}</td>
              </tr>
              <tr>
                <td><strong>Équipement :</strong></td>
                <td>${task.equipment_name || "-"}</td>
              </tr>
              <tr>
                <td><strong>Date prévue :</strong></td>
                <td>${formattedDueDate}</td>
              </tr>
              <tr>
                <td><strong>Description :</strong></td>
                <td>${task.description || "-"}</td>
              </tr>
            </table>
            <p>Veuillez planifier cette intervention dans votre agenda.</p>
            <p>Cordialement,<br>L'équipe NordAgri</p>
          `;
          
          const smsBody = `Rappel: Maintenance "${task.title}" pour ${task.equipment_name || "équipement"} due le ${formattedDueDate}. Connectez-vous à l'application pour plus de détails.`;
          
          // Send notifications based on preferences
          if (notificationSettings?.email_notifications && assignedUser.email) {
            await sendEmail({
              to: assignedUser.email,
              subject,
              html: emailBody
            });
          }
          
          if (notificationSettings?.sms_notifications && assignedUser.phone) {
            await sendSMS(assignedUser.phone, smsBody);
          }
        }
      }
      
      // Also notify task creator if different from assigned user
      if (task.created_by && task.created_by !== task.assigned_to) {
        const { data: creatorUser } = await serviceClient
          .from("profiles")
          .select(`
            id, 
            first_name,
            last_name,
            email
          `)
          .eq("id", task.created_by)
          .single();
        
        if (creatorUser?.email) {
          const name = `${creatorUser.first_name || ""} ${creatorUser.last_name || ""}`.trim();
          
          // Send only email to creator (not SMS)
          await sendEmail({
            to: creatorUser.email,
            subject: `Plan de maintenance: ${task.title} - dû dans 7 jours`,
            html: `
              <h2>Information sur une maintenance planifiée</h2>
              <p>Bonjour ${name || ""},</p>
              <p>Nous vous informons qu'une tâche de maintenance que vous avez créée est prévue dans 7 jours :</p>
              <table border="0" cellpadding="5">
                <tr>
                  <td><strong>Titre :</strong></td>
                  <td>${task.title}</td>
                </tr>
                <tr>
                  <td><strong>Équipement :</strong></td>
                  <td>${task.equipment_name || "-"}</td>
                </tr>
                <tr>
                  <td><strong>Assigné à :</strong></td>
                  <td>${task.assigned_to ? "Un technicien" : "Non assigné"}</td>
                </tr>
                <tr>
                  <td><strong>Date prévue :</strong></td>
                  <td>${formattedDueDate}</td>
                </tr>
              </table>
              <p>Cordialement,<br>L'équipe NordAgri</p>
            `
          });
        }
      }
    }
    
    return { processed: upcomingTasks?.length || 0 };
  } catch (error) {
    console.error("Error checking upcoming maintenance:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the notification type from query parameters
    const url = new URL(req.url);
    const notificationType = url.searchParams.get("type");

    // Check for authorization - simple API key for demo purposes
    // In production, implement proper authentication
    const authorization = req.headers.get("authorization");
    const apiKey = authorization?.replace("Bearer ", "");
    
    // Verify API key (insecure demo - use better auth in production)
    if (apiKey !== Deno.env.get("NOTIFICATIONS_API_KEY")) {
      return createResponse({ error: "Unauthorized - invalid API key" }, 401);
    }

    // Process based on notification type
    let result;
    switch (notificationType) {
      case "low_stock":
        result = await checkLowStockParts();
        break;
      case "maintenance":
        result = await checkUpcomingMaintenance();
        break;
      default:
        // If no specific type is provided, run all checks
        const lowStock = await checkLowStockParts();
        const maintenance = await checkUpcomingMaintenance();
        result = {
          low_stock: lowStock,
          maintenance: maintenance
        };
    }

    return createResponse({
      success: true,
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error) {
    console.error("Error processing notifications:", error);
    return createResponse({
      error: error.message
    }, 500);
  }
});
