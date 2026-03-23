import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface TelemetryPayload {
  operation: string;
  table_name?: string | null;
  rpc_name?: string | null;
  duration_ms: number;
  record_count?: number | null;
  query_limit?: number | null;
  query_offset?: number | null;
  count_mode?: string | null;
  error_message?: string | null;
}

interface BridgeRequest {
  action: 'query' | 'emit_telemetry' | 'batch_telemetry' | 'health';
  payload?: TelemetryPayload;
  payloads?: TelemetryPayload[];
  query?: {
    table: string;
    operation: 'select' | 'insert' | 'update' | 'delete';
    filters?: Record<string, unknown>;
    data?: Record<string, unknown> | Record<string, unknown>[];
    limit?: number;
    offset?: number;
  };
}

function classifySeverity(durationMs: number, errorMessage?: string | null): string {
  if (errorMessage) return 'error';
  if (durationMs >= 8000) return 'very_slow';
  if (durationMs >= 3000) return 'slow';
  return 'normal';
}

function validateTelemetryPayload(payload: TelemetryPayload): string | null {
  if (!payload.operation || typeof payload.operation !== 'string') {
    return 'operation is required and must be a string';
  }
  if (typeof payload.duration_ms !== 'number' || payload.duration_ms < 0) {
    return 'duration_ms must be a non-negative number';
  }
  const validOps = ['select', 'insert', 'update', 'delete', 'rpc', 'count', 'upsert'];
  if (!validOps.includes(payload.operation)) {
    return `operation must be one of: ${validOps.join(', ')}`;
  }
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Authenticate via JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Bearer token required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub as string;

    const body: BridgeRequest = await req.json();

    switch (body.action) {
      case 'health': {
        return new Response(
          JSON.stringify({ status: 'ok', timestamp: new Date().toISOString(), user_id: userId }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'emit_telemetry': {
        if (!body.payload) {
          return new Response(
            JSON.stringify({ error: 'payload is required for emit_telemetry' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const validationError = validateTelemetryPayload(body.payload);
        if (validationError) {
          return new Response(
            JSON.stringify({ error: validationError }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const severity = classifySeverity(body.payload.duration_ms, body.payload.error_message);

        const { data, error } = await supabase
          .from('query_telemetry')
          .insert({
            operation: body.payload.operation,
            table_name: body.payload.table_name ?? null,
            rpc_name: body.payload.rpc_name ?? null,
            duration_ms: body.payload.duration_ms,
            record_count: body.payload.record_count ?? null,
            query_limit: body.payload.query_limit ?? null,
            query_offset: body.payload.query_offset ?? null,
            count_mode: body.payload.count_mode ?? null,
            severity,
            error_message: body.payload.error_message ?? null,
            user_id: userId,
          })
          .select('id')
          .single();

        if (error) {
          console.error('[external-db-bridge] Insert telemetry error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to persist telemetry', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, id: data.id, severity }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'batch_telemetry': {
        if (!body.payloads || !Array.isArray(body.payloads) || body.payloads.length === 0) {
          return new Response(
            JSON.stringify({ error: 'payloads array is required for batch_telemetry' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (body.payloads.length > 100) {
          return new Response(
            JSON.stringify({ error: 'Maximum 100 payloads per batch' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const errors: string[] = [];
        const rows = body.payloads.map((p, i) => {
          const validationError = validateTelemetryPayload(p);
          if (validationError) {
            errors.push(`payload[${i}]: ${validationError}`);
            return null;
          }
          return {
            operation: p.operation,
            table_name: p.table_name ?? null,
            rpc_name: p.rpc_name ?? null,
            duration_ms: p.duration_ms,
            record_count: p.record_count ?? null,
            query_limit: p.query_limit ?? null,
            query_offset: p.query_offset ?? null,
            count_mode: p.count_mode ?? null,
            severity: classifySeverity(p.duration_ms, p.error_message),
            error_message: p.error_message ?? null,
            user_id: userId,
          };
        }).filter(Boolean);

        if (errors.length > 0) {
          return new Response(
            JSON.stringify({ error: 'Validation errors', details: errors }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('query_telemetry')
          .insert(rows)
          .select('id');

        if (error) {
          console.error('[external-db-bridge] Batch insert error:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to persist batch telemetry', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, inserted: data?.length ?? 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'query': {
        if (!body.query) {
          return new Response(
            JSON.stringify({ error: 'query object is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const startMs = Date.now();
        const q = body.query;
        let result: { data: unknown; error: unknown; count?: number } = { data: null, error: null };

        try {
          if (q.operation === 'select') {
            let query = supabase.from(q.table).select('*', { count: 'exact' });
            if (q.filters) {
              for (const [key, value] of Object.entries(q.filters)) {
                query = query.eq(key, value);
              }
            }
            if (q.limit) query = query.limit(q.limit);
            if (q.offset) query = query.range(q.offset, q.offset + (q.limit || 10) - 1);
            result = await query;
          } else if (q.operation === 'insert' && q.data) {
            result = await supabase.from(q.table).insert(q.data).select();
          } else if (q.operation === 'update' && q.data && q.filters) {
            let query = supabase.from(q.table).update(q.data);
            for (const [key, value] of Object.entries(q.filters)) {
              query = query.eq(key, value);
            }
            result = await query.select();
          } else if (q.operation === 'delete' && q.filters) {
            let query = supabase.from(q.table).delete();
            for (const [key, value] of Object.entries(q.filters)) {
              query = query.eq(key, value);
            }
            result = await query.select();
          } else {
            return new Response(
              JSON.stringify({ error: 'Invalid query configuration' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (err) {
          result.error = err;
        }

        const durationMs = Date.now() - startMs;
        const recordCount = Array.isArray(result.data) ? result.data.length : 0;
        const errorMsg = result.error ? String(result.error) : null;

        // Auto-emit telemetry for the query
        await supabase.from('query_telemetry').insert({
          operation: q.operation,
          table_name: q.table,
          duration_ms: durationMs,
          record_count: recordCount,
          query_limit: q.limit ?? null,
          query_offset: q.offset ?? null,
          severity: classifySeverity(durationMs, errorMsg),
          error_message: errorMsg,
          user_id: userId,
        });

        if (result.error) {
          return new Response(
            JSON.stringify({ error: 'Query failed', details: String(result.error) }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: result.data,
            count: recordCount,
            duration_ms: durationMs,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${body.action}`, valid_actions: ['health', 'emit_telemetry', 'batch_telemetry', 'query'] }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (err) {
    console.error('[external-db-bridge] Unhandled error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
