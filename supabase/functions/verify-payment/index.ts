
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get request data
    const { paymentUrl, userId } = await req.json();

    if (!paymentUrl || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing paymentUrl or userId" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Parse URL parameters
    const url = new URL(paymentUrl);
    const params = url.searchParams;
    
    const success = params.get("success") === "true";
    const txnResponseCode = params.get("txn_response_code");
    const message = params.get("data.message");
    const paymentReference = params.get("id");
    
    console.log("Payment verification:", { success, txnResponseCode, message, paymentReference });

    if (success && (txnResponseCode === "APPROVED" || message === "Approved")) {
      // Calculate subscription expiry (1 month from now)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      
      // Insert or update subscription record
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          is_active: true,
          payment_reference: paymentReference,
          amount: 5141, // 51.41 AED
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) {
        console.error("Error updating subscription:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Subscription activated successfully", 
          data 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Payment was not successful" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Error processing payment verification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
