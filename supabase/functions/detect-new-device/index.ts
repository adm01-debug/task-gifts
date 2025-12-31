import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeviceRequest {
  userId: string;
  fingerprint: string;
  userAgent: string;
  browser?: string;
  os?: string;
  deviceType?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const body: DeviceRequest = await req.json();
    const { userId, fingerprint, userAgent, browser, os, deviceType } = body;
    
    if (!userId || !fingerprint) {
      return new Response(
        JSON.stringify({ error: "userId and fingerprint are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get IP from request headers
    const forwarded = req.headers.get("x-forwarded-for");
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : "0.0.0.0";
    
    console.log(`Registering device for user ${userId} from IP ${ipAddress}`);
    
    // Call the database function to register device
    const { data, error } = await supabase.rpc("register_device", {
      p_user_id: userId,
      p_fingerprint: fingerprint,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_browser: browser || null,
      p_os: os || null,
      p_device_type: deviceType || "desktop"
    });
    
    if (error) {
      console.error("Error registering device:", error);
      throw error;
    }
    
    console.log(`Device registration result:`, data);
    
    // If new device, log security event
    if (data?.is_new_device) {
      console.log(`New device detected for user ${userId}: ${browser} on ${os}`);
      
      // Insert security alert
      await supabase.from("security_alerts").insert({
        alert_type: "new_device",
        severity: "low",
        title: `Novo dispositivo detectado`,
        description: `Login de novo dispositivo: ${browser || "Desconhecido"} em ${os || "Desconhecido"}`,
        user_id: userId,
        ip_address: ipAddress,
        metadata: {
          device_id: data.device_id,
          browser,
          os,
          device_type: deviceType,
          fingerprint: fingerprint.substring(0, 8) + "..."
        }
      });
    }
    
    return new Response(
      JSON.stringify({
        is_new_device: data?.is_new_device || false,
        device_id: data?.device_id,
        is_trusted: data?.is_trusted || false
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
    
  } catch (error: any) {
    console.error("Error in detect-new-device:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
