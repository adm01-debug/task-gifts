-- LGPD Right to Erasure (Art. 18, VI)
-- Anonymizes user data instead of hard delete to preserve referential integrity.

CREATE OR REPLACE FUNCTION anonymize_user_data(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_anon_name TEXT := 'Usuário Removido #' || LEFT(p_user_id::TEXT, 8);
BEGIN
  -- Only admins or the user themselves can request erasure
  IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')) THEN
      RAISE EXCEPTION 'Unauthorized: only the user or an admin can request data erasure';
    END IF;
  END IF;

  -- Anonymize profile
  UPDATE profiles SET
    display_name = v_anon_name,
    email = 'removed-' || LEFT(p_user_id::TEXT, 8) || '@anonymized.local',
    avatar_url = NULL,
    cpf = NULL,
    phone = NULL,
    personal_email = NULL,
    status = 'inactive',
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Delete authentication data
  DELETE FROM user_two_factor WHERE user_id = p_user_id;
  DELETE FROM webauthn_credentials WHERE user_id = p_user_id;

  -- Delete access logs
  DELETE FROM ip_access_logs WHERE ip_address IN (
    SELECT DISTINCT ip_address FROM login_attempts WHERE email = (
      SELECT email FROM profiles WHERE id = p_user_id
    )
  );

  -- Anonymize audit logs (keep for compliance but remove PII)
  UPDATE audit_logs SET
    metadata = jsonb_set(COALESCE(metadata, '{}'::JSONB), '{anonymized}', 'true'::JSONB)
  WHERE user_id = p_user_id;

  -- Delete notifications
  DELETE FROM notifications WHERE user_id = p_user_id;

  -- Deactivate roles
  DELETE FROM user_roles WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'user_id', p_user_id,
    'anonymized_as', v_anon_name,
    'timestamp', NOW()
  );
END;
$$;
