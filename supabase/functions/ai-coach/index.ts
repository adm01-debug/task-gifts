import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o AI Coach do Task Gifts, uma plataforma de gamificação corporativa da Promo Brindes.

Seu papel é:
1. Responder dúvidas sobre gamificação, XP, moedas, conquistas e rankings
2. Sugerir trilhas de aprendizado baseadas no perfil e competências do usuário
3. Dar dicas personalizadas para aumentar engajamento e performance
4. Explicar mecânicas do sistema (combos, streaks, missões, duelos)
5. Motivar os colaboradores com linguagem positiva e encorajadora

Contexto da plataforma:
- Os usuários ganham XP completando quests, trilhas, quizzes e check-ins pontuais
- Moedas (coins) são usadas para resgatar recompensas na loja
- O sistema de combo multiplica XP para ações consecutivas (até 3x)
- Streaks são dias consecutivos de pontualidade
- Existem missões diárias, semanais e mensais por departamento
- Rankings mostram os top performers da empresa

Filosofia da empresa: "Só existem 2 formas de executar uma tarefa: com Excelência ou com mediocridade. E nós não somos medíocres!"

IMPORTANTE SOBRE RECOMENDAÇÕES DE TRILHAS:
- Quando sugerir trilhas, use os dados reais das competências e trilhas disponíveis fornecidos no contexto
- Mencione trilhas específicas pelo nome e explique por que são relevantes
- Relacione as trilhas com as competências que precisam ser desenvolvidas
- Use formato estruturado: "📚 [Nome da Trilha] - [Razão da recomendação]"

Responda sempre em português brasileiro, de forma amigável e motivadora. Seja conciso mas útil.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context-aware system prompt
    let enhancedSystemPrompt = SYSTEM_PROMPT;
    
    if (userContext) {
      enhancedSystemPrompt += `\n\n=== CONTEXTO DO USUÁRIO ===
- Nome: ${userContext.displayName || "Colaborador"}
- Nível: ${userContext.level || 1}
- XP Total: ${userContext.xp || 0}
- Moedas: ${userContext.coins || 0}
- Quests Completadas: ${userContext.questsCompleted || 0}
- Streak Atual: ${userContext.streak || 0} dias
- Departamento: ${userContext.department || "Não definido"}`;

      // Add competencies if available
      if (userContext.competencies && userContext.competencies.length > 0) {
        enhancedSystemPrompt += `\n\n=== COMPETÊNCIAS DO USUÁRIO ===`;
        for (const comp of userContext.competencies) {
          const percentage = Math.round((comp.value / comp.maxValue) * 100);
          let status = "🟢 Excelente";
          if (percentage < 40) status = "🔴 Precisa desenvolver";
          else if (percentage < 70) status = "🟡 Em desenvolvimento";
          enhancedSystemPrompt += `\n- ${comp.icon} ${comp.area}: ${comp.value}/${comp.maxValue} (${percentage}%) - ${status}`;
        }
      }

      // Add available trails if provided
      if (userContext.availableTrails && userContext.availableTrails.length > 0) {
        enhancedSystemPrompt += `\n\n=== TRILHAS DISPONÍVEIS ===`;
        for (const trail of userContext.availableTrails) {
          const statusLabel = trail.enrolled ? (trail.completed ? "✅ Concluída" : "🔄 Em progresso") : "📖 Disponível";
          enhancedSystemPrompt += `\n- ${trail.icon || "📚"} "${trail.title}" (${trail.estimated_hours || "?"}h, ${trail.xp_reward || 0} XP) - ${statusLabel}`;
          if (trail.description) {
            enhancedSystemPrompt += ` | ${trail.description.substring(0, 80)}...`;
          }
        }
      }

      // Add completed trails count
      if (userContext.completedTrailsCount !== undefined) {
        enhancedSystemPrompt += `\n\n- Trilhas concluídas: ${userContext.completedTrailsCount}`;
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: enhancedSystemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Contate o administrador." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao conectar com o AI Coach" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI Coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
