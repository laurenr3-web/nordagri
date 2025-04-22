
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

// ERP entry types
enum ERPEntryType {
  EQUIPMENT = "equipment",
  FUEL = "fuel",
  TIME = "time",
  MAINTENANCE = "maintenance",
  PART = "part"
}

// Interface for ERP entry data
interface ERPEntryData {
  equipment_id?: number;
  fuel_log_id?: string;
  time_session_id?: string;
  maintenance_id?: string;
  part_id?: number;
  type: ERPEntryType;
  cost_center: string;
  amount: number;
  reference?: string;
  date: string;
  description?: string;
  metadata?: Record<string, any>;
}

// Create accounting table if it doesn't exist (this would normally be in a migration)
async function ensureAccountingTableExists() {
  try {
    // Check if table exists
    const { error: checkError } = await serviceClient
      .from("erp_accounting_entries")
      .select("id", { count: "exact", head: true });
    
    // If table doesn't exist, we'll get an error
    if (checkError) {
      console.log("Accounting entries table doesn't exist, creating it...");
      
      // Create the table
      const { error: createError } = await serviceClient.rpc("create_erp_accounting_entries_table");
      
      if (createError) throw createError;
      
      console.log("Table created successfully");
    } else {
      console.log("Accounting entries table already exists");
    }
  } catch (error) {
    console.error("Error ensuring accounting table exists:", error);
    // Don't throw, just log - we'll let the actual operation handle errors
  }
}

// Handler for the ERP integration endpoint
serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return createResponse({
      error: "Method not allowed"
    }, 405);
  }

  try {
    // Check for authorization - API key
    const authorization = req.headers.get("authorization");
    const apiKey = authorization?.replace("Bearer ", "");
    
    // Verify API key
    if (apiKey !== Deno.env.get("ERP_API_KEY")) {
      return createResponse({ error: "Unauthorized - invalid API key" }, 401);
    }

    // Ensure we have the necessary table
    await ensureAccountingTableExists();

    // Parse the request body
    const data: ERPEntryData = await req.json();
    
    // Validate required fields
    if (!data.type || !data.cost_center || data.amount === undefined || !data.date) {
      return createResponse({
        error: "Missing required fields: type, cost_center, amount, date"
      }, 400);
    }
    
    // Validate entry type
    if (!Object.values(ERPEntryType).includes(data.type as ERPEntryType)) {
      return createResponse({
        error: "Invalid entry type",
        allowed_types: Object.values(ERPEntryType)
      }, 400);
    }
    
    // Validate references based on type
    switch (data.type) {
      case ERPEntryType.EQUIPMENT:
        if (!data.equipment_id) {
          return createResponse({ error: "equipment_id is required for equipment entries" }, 400);
        }
        break;
      case ERPEntryType.FUEL:
        if (!data.fuel_log_id) {
          return createResponse({ error: "fuel_log_id is required for fuel entries" }, 400);
        }
        break;
      case ERPEntryType.TIME:
        if (!data.time_session_id) {
          return createResponse({ error: "time_session_id is required for time entries" }, 400);
        }
        break;
      case ERPEntryType.MAINTENANCE:
        if (!data.maintenance_id) {
          return createResponse({ error: "maintenance_id is required for maintenance entries" }, 400);
        }
        break;
      case ERPEntryType.PART:
        if (!data.part_id) {
          return createResponse({ error: "part_id is required for part entries" }, 400);
        }
        break;
    }
    
    // Prepare entry data
    const entryData = {
      type: data.type,
      cost_center: data.cost_center,
      amount: data.amount,
      reference: data.reference || null,
      description: data.description || null,
      entry_date: data.date,
      equipment_id: data.equipment_id || null,
      fuel_log_id: data.fuel_log_id || null,
      time_session_id: data.time_session_id || null,
      maintenance_id: data.maintenance_id || null,
      part_id: data.part_id || null,
      metadata: data.metadata || null,
      created_at: new Date().toISOString()
    };
    
    // Insert the entry into the database
    const { data: insertedEntry, error: insertError } = await serviceClient
      .from("erp_accounting_entries")
      .insert(entryData)
      .select("id")
      .single();
    
    if (insertError) throw insertError;
    
    // Return the entry ID
    return createResponse({
      success: true,
      message: "Entry created successfully",
      entry_id: insertedEntry.id
    });
  } catch (error) {
    console.error("Error processing ERP entry:", error);
    return createResponse({
      error: error.message
    }, 500);
  }
});
