import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCorsPreflightIfNeeded } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const preflightResponse = handleCorsPreflightIfNeeded(req);
  if (preflightResponse) return preflightResponse;

  const corsHeaders = getCorsHeaders(req);
  const start = Date.now();

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check DB connectivity
    const { error: dbError } = await supabase.from("profiles").select("id", { count: "exact", head: true });

    const dbOk = !dbError;
    const latencyMs = Date.now() - start;
    const status = dbOk ? "healthy" : "degraded";

    return new Response(
      JSON.stringify({
        status,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        checks: {
          database: { status: dbOk ? "up" : "down", latency_ms: latencyMs },
          edge_functions: { status: "up" },
        },
      }),
      {
        status: dbOk ? 200 : 503,
        headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-cache" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ status: "unhealthy", error: String(error), timestamp: new Date().toISOString() }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
