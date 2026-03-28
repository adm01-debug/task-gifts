# Política de Retenção de Dados — GameficaRH

## Objetivo

Definir prazos de retenção e procedimentos de exclusão de dados pessoais conforme a LGPD (Lei 13.709/2018).

## Categorias de Dados

| Categoria | Exemplos | Retenção | Base Legal |
|-----------|----------|----------|-----------|
| **Dados de perfil** | nome, email, avatar | Enquanto conta ativa + 6 meses após exclusão | Execução de contrato |
| **Dados de gamificação** | XP, coins, level, streak | Enquanto conta ativa | Legítimo interesse |
| **Dados de autenticação** | password hash, 2FA secrets, WebAuthn | Enquanto conta ativa | Execução de contrato |
| **Logs de auditoria** | audit_logs, ip_access_logs | 12 meses | Legítimo interesse |
| **Logs de acesso** | login_attempts, attendance | 6 meses | Legítimo interesse |
| **Dados de integração** | bitrix24_webhook_logs, api_request_logs | 90 dias | Legítimo interesse |
| **Telemetria** | query_telemetry | 30 dias | Legítimo interesse |

## Direito ao Esquecimento (Art. 18, VI LGPD)

Quando um titular solicitar exclusão dos seus dados:

1. **Receber solicitação** via DPO (dpo@gamificarh.com.br) ou painel de configurações
2. **Verificar identidade** do solicitante (2FA ou email confirmation)
3. **Anonimizar dados pessoais** em:
   - `profiles`: substituir display_name por "Usuário Removido", limpar email/cpf/phone
   - `audit_logs`: manter logs mas anonimizar user_id
   - `kudos`: manter histórico mas anonimizar from/to_user_id
4. **Excluir dados desnecessários**:
   - `user_two_factor`: DELETE
   - `webauthn_credentials`: DELETE
   - `login_attempts`: DELETE
   - `ip_access_logs`: DELETE onde user_id = solicitante
5. **Notificar** o titular da conclusão em até 15 dias

## Limpeza Automática

| Tabela | Critério | Frequência |
|--------|---------|-----------|
| `query_telemetry` | `created_at < NOW() - 30 days` | Diário |
| `api_request_logs` | `created_at < NOW() - 90 days` | Semanal |
| `webauthn_challenges` | `expires_at < NOW()` | A cada 10 min (pg_cron) |
| `ip_access_logs` | `created_at < NOW() - 6 months` | Mensal |

## DPO (Encarregado de Dados)

- **Contato**: dpo@gamificarh.com.br
- **Responsabilidade**: Receber e processar solicitações de titulares
- **SLA**: Resposta em até 15 dias úteis
