import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    let payload;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      payload = Object.fromEntries(formData);
    } else {
      const text = await req.text();
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { raw: text };
      }
    }

    console.log('Bitrix24 webhook received:', JSON.stringify(payload));

    // Determine event type
    const eventType = payload.event || payload.EVENT || 'unknown';
    const eventData = payload.data || payload.DATA || payload;

    // Log the webhook
    const { data: logEntry, error: logError } = await supabase
      .from('bitrix24_webhook_logs')
      .insert({
        event_type: eventType,
        payload: eventData,
        processed: false,
      })
      .select()
      .single();

    if (logError) {
      console.error('Error logging webhook:', logError);
    }

    // Process different event types
    let processed = false;
    let errorMessage = null;

    try {
      switch (eventType) {
        // CRM Lead events
        case 'ONCRMLEADADD':
        case 'ONCRMLEADUPDATE':
        case 'ONCRMLEADDELETE':
          await processCrmEvent(supabase, 'lead', eventType, eventData);
          processed = true;
          break;

        // CRM Deal events
        case 'ONCRMDEALADD':
        case 'ONCRMDEALUPDATE':
        case 'ONCRMDEALDELETE':
          await processCrmEvent(supabase, 'deal', eventType, eventData);
          processed = true;
          break;

        // CRM Contact events
        case 'ONCRMCONTACTADD':
        case 'ONCRMCONTACTUPDATE':
        case 'ONCRMCONTACTDELETE':
          await processCrmEvent(supabase, 'contact', eventType, eventData);
          processed = true;
          break;

        // Task events
        case 'ONTASKADD':
        case 'ONTASKUPDATE':
        case 'ONTASKDELETE':
        case 'ONTASKCOMPLETE':
          await processTaskEvent(supabase, eventType, eventData);
          processed = true;
          break;

        // User events
        case 'ONUSERADD':
        case 'ONUSERUPDATE':
          await processUserEvent(supabase, eventType, eventData);
          processed = true;
          break;

        default:
          console.log(`Unhandled event type: ${eventType}`);
          processed = true; // Mark as processed to avoid retry loops
      }
    } catch (processError) {
      console.error('Error processing webhook:', processError);
      errorMessage = processError instanceof Error ? processError.message : 'Erro ao processar';
    }

    // Update log entry with processing status
    if (logEntry) {
      await supabase
        .from('bitrix24_webhook_logs')
        .update({ 
          processed, 
          error_message: errorMessage 
        })
        .eq('id', logEntry.id);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bitrix24 webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Process CRM events (leads, deals, contacts)
async function processCrmEvent(supabase: any, entityType: string, eventType: string, data: any) {
  const bitrixId = data.FIELDS?.ID || data.id;
  
  if (!bitrixId) return;

  const action = eventType.includes('ADD') ? 'created' : 
                 eventType.includes('UPDATE') ? 'updated' : 'deleted';

  // Update or create sync mapping
  if (action !== 'deleted') {
    await supabase
      .from('bitrix24_sync_mappings')
      .upsert({
        entity_type: 'bitrix_crm',
        local_id: `bitrix_${entityType}_${bitrixId}`,
        bitrix_id: bitrixId.toString(),
        bitrix_entity_type: entityType,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
        metadata: data.FIELDS || data,
      }, { onConflict: 'entity_type,local_id,bitrix_entity_type' });
  } else {
    await supabase
      .from('bitrix24_sync_mappings')
      .update({ sync_status: 'deleted' })
      .eq('bitrix_id', bitrixId.toString())
      .eq('bitrix_entity_type', entityType);
  }

  // Create notification for admins
  const { data: admins } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin');

  if (admins?.length) {
    const notifications = admins.map((admin: any) => ({
      user_id: admin.user_id,
      title: `Bitrix24: ${entityType} ${action}`,
      message: `Um ${entityType} foi ${action === 'created' ? 'criado' : action === 'updated' ? 'atualizado' : 'deletado'} no Bitrix24`,
      type: 'bitrix24',
      data: { entityType, action, bitrixId },
    }));

    await supabase.from('notifications').insert(notifications);
  }
}

// Process Task events
async function processTaskEvent(supabase: any, eventType: string, data: any) {
  const taskId = data.FIELDS?.ID || data.id;
  
  if (!taskId) return;

  const action = eventType.includes('ADD') ? 'created' : 
                 eventType.includes('UPDATE') ? 'updated' : 
                 eventType.includes('COMPLETE') ? 'completed' : 'deleted';

  // Check if we have a local quest mapped to this task
  const { data: mapping } = await supabase
    .from('bitrix24_sync_mappings')
    .select('*')
    .eq('bitrix_id', taskId.toString())
    .eq('bitrix_entity_type', 'task')
    .single();

  if (mapping && action === 'completed') {
    // Auto-complete the linked quest assignment
    const { data: assignment } = await supabase
      .from('quest_assignments')
      .select('*')
      .eq('id', mapping.local_id)
      .is('completed_at', null)
      .single();

    if (assignment) {
      await supabase
        .from('quest_assignments')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', assignment.id);

      // Grant rewards
      const { data: quest } = await supabase
        .from('custom_quests')
        .select('xp_reward, coin_reward')
        .eq('id', assignment.quest_id)
        .single();

      if (quest) {
        await supabase.rpc('add_user_xp', { 
          user_id: assignment.user_id, 
          xp_amount: quest.xp_reward 
        });
      }
    }
  }

  // Update sync mapping
  await supabase
    .from('bitrix24_sync_mappings')
    .upsert({
      entity_type: 'bitrix_task',
      local_id: mapping?.local_id || `bitrix_task_${taskId}`,
      bitrix_id: taskId.toString(),
      bitrix_entity_type: 'task',
      sync_status: action === 'deleted' ? 'deleted' : 'synced',
      last_synced_at: new Date().toISOString(),
      metadata: data.FIELDS || data,
    }, { onConflict: 'entity_type,local_id,bitrix_entity_type' });
}

// Process User events
async function processUserEvent(supabase: any, eventType: string, data: any) {
  const userId = data.FIELDS?.ID || data.id;
  
  if (!userId) return;

  // Store user mapping for future sync
  await supabase
    .from('bitrix24_sync_mappings')
    .upsert({
      entity_type: 'user',
      local_id: `bitrix_user_${userId}`,
      bitrix_id: userId.toString(),
      bitrix_entity_type: 'user',
      sync_status: 'synced',
      last_synced_at: new Date().toISOString(),
      metadata: data.FIELDS || data,
    }, { onConflict: 'entity_type,local_id,bitrix_entity_type' });
}
