
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No auth header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    if (!user?.email) throw new Error("User not authenticated");

    // Find the stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let stripe_customer_id = null;
    if (customers.data.length === 0) {
      // Write user as free in database, return free plan
      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        plan: "free",
        stripe_customer_id: null,
        status: "free",
      }, { onConflict: 'user_id' });
      return new Response(JSON.stringify({ plan: "free", status: "free", active: false }), { headers: corsHeaders });
    }
    stripe_customer_id = customers.data[0].id;

    // List subscriptions, get most recent
    const subs = await stripe.subscriptions.list({
      customer: stripe_customer_id,
      status: "all",
      limit: 1,
    });
    if (!subs.data[0]) {
      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        plan: "free",
        stripe_customer_id,
        status: "free",
      }, { onConflict: 'user_id' });
      return new Response(JSON.stringify({ plan: "free", status: "free", active: false }), { headers: corsHeaders });
    }
    const sub = subs.data[0];

    // Determine plan by price, update status if needed
    let plan = "pro";
    if (sub.items?.data[0]?.price?.unit_amount === 29000 || sub.items?.data[0]?.plan?.amount === 29000) {
      plan = "pro";
    } else if (sub.items?.data[0]?.price?.unit_amount > 29000) {
      plan = "enterprise";
    }

    // Write info to DB
    await supabase.from("subscriptions").upsert({
      user_id: user.id,
      plan,
      stripe_customer_id,
      stripe_subscription_id: sub.id,
      status: sub.status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
    }, { onConflict: 'user_id' });

    const active = sub.status === "active" || sub.status === "trialing" || sub.status === "past_due";
    return new Response(JSON.stringify({
      plan,
      status: sub.status,
      stripe_subscription_id: sub.id,
      active,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    }), { headers: corsHeaders });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
