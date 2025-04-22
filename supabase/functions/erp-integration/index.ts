
// @feature: api-integration
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// CORS headers for API responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create Supabase clients
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to verify JWT token and get user
async function verifyToken(authHeader: string | null): Promise<any> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token or user not found');
  }
  
  return user;
}

// Helper to get farm ID from user ID
async function getUserFarmId(userId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('farm_id')
    .eq('id', userId)
    .single();
  
  if (error || !data?.farm_id) {
    throw new Error('Failed to get farm ID or user has no farm');
  }
  
  return data.farm_id;
}

// Create a response with proper headers
function createResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

// API Router
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Get the API endpoint from the URL
  const url = new URL(req.url);
  const path = url.pathname.slice(1); // Remove leading slash
  const segments = path.split('/');
  
  try {
    // Verify authorization for all routes except options
    let user, farmId;
    try {
      user = await verifyToken(req.headers.get('authorization'));
      farmId = await getUserFarmId(user.id);
    } catch (error) {
      return createResponse({ error: 'Unauthorized access' }, 401);
    }
    
    // Route: GET /equipment
    if (segments[0] === 'equipment' && req.method === 'GET') {
      // Query parameters
      const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit') || '10') : 10;
      const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset') || '0') : 0;
      const status = url.searchParams.get('status');
      
      // Base query
      let query = supabaseAdmin
        .from('equipment')
        .select('*')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      // Add filters if provided
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching equipment:', error);
        return createResponse({ error: 'Failed to fetch equipment' }, 500);
      }
      
      return createResponse({ 
        data,
        metadata: {
          count, 
          limit, 
          offset
        }
      });
    }
    
    // Route: POST /time-entries
    else if (segments[0] === 'time-entries' && req.method === 'POST') {
      const payload = await req.json();
      
      // Validate required fields
      if (!payload.equipment_id || !payload.task_type) {
        return createResponse({ error: 'Missing required fields' }, 400);
      }
      
      // Add user ID and default values
      payload.user_id = user.id;
      payload.status = payload.status || 'active';
      payload.start_time = payload.start_time || new Date().toISOString();
      
      // Insert the time entry
      const { data, error } = await supabaseAdmin
        .from('time_sessions')
        .insert([payload])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating time entry:', error);
        return createResponse({ error: 'Failed to create time entry' }, 500);
      }
      
      return createResponse({ data, message: 'Time entry created successfully' });
    }
    
    // Route: GET /fuel-logs
    else if (segments[0] === 'fuel-logs' && req.method === 'GET') {
      const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit') || '10') : 10;
      const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset') || '0') : 0;
      const equipment_id = url.searchParams.get('equipment_id');
      
      let query = supabaseAdmin
        .from('fuel_logs')
        .select('*')
        .eq('farm_id', farmId)
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (equipment_id) {
        query = query.eq('equipment_id', equipment_id);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching fuel logs:', error);
        return createResponse({ error: 'Failed to fetch fuel logs' }, 500);
      }
      
      return createResponse({ 
        data, 
        metadata: {
          count, 
          limit, 
          offset
        }
      });
    }
    
    // Route: POST /fuel-logs
    else if (segments[0] === 'fuel-logs' && req.method === 'POST') {
      const payload = await req.json();
      
      // Validate required fields
      if (!payload.equipment_id || !payload.fuel_quantity_liters || !payload.price_per_liter || !payload.date) {
        return createResponse({ error: 'Missing required fields' }, 400);
      }
      
      // Add user ID and farm ID
      payload.created_by = user.id;
      payload.farm_id = farmId;
      
      // Insert the fuel log
      const { data, error } = await supabaseAdmin
        .from('fuel_logs')
        .insert([payload])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating fuel log:', error);
        return createResponse({ error: 'Failed to create fuel log' }, 500);
      }
      
      return createResponse({ data, message: 'Fuel log created successfully' });
    }
    
    // Route: GET /sync/inventory
    else if (segments[0] === 'sync' && segments[1] === 'inventory' && req.method === 'GET') {
      const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit') || '100') : 100;
      const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset') || '0') : 0;
      const since = url.searchParams.get('since') || null; // ISO date string
      
      let query = supabaseAdmin
        .from('parts_inventory')
        .select('*')
        .eq('farm_id', farmId)
        .range(offset, offset + limit - 1);
      
      // Only get records updated since a certain date if specified
      if (since) {
        query = query.gt('updated_at', since);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        console.error('Error fetching inventory for ERP sync:', error);
        return createResponse({ error: 'Failed to fetch inventory' }, 500);
      }
      
      return createResponse({ 
        data, 
        metadata: {
          count,
          limit,
          offset,
          sync_timestamp: new Date().toISOString()
        }
      });
    }
    
    // If no route matched
    return createResponse({ error: 'Endpoint not found' }, 404);
  } catch (error) {
    console.error('Error processing request:', error);
    return createResponse({ error: error.message || 'Internal server error' }, 500);
  }
});
