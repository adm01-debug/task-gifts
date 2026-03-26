-- Add TTL mechanism for WebAuthn challenges.
-- Abandoned challenges (not used within 5 minutes) are automatically cleaned up.

-- Add expires_at column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'webauthn_challenges' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE webauthn_challenges
    ADD COLUMN expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '5 minutes');
  END IF;
END;
$$;

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_expires_at
ON webauthn_challenges (expires_at)
WHERE expires_at IS NOT NULL;

-- Function to clean up expired challenges
CREATE OR REPLACE FUNCTION cleanup_expired_webauthn_challenges()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM webauthn_challenges
  WHERE expires_at < NOW();

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;

-- Schedule cleanup via pg_cron if available (runs every 10 minutes)
-- Note: pg_cron must be enabled in the Supabase dashboard
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'cleanup-webauthn-challenges',
      '*/10 * * * *',
      'SELECT cleanup_expired_webauthn_challenges();'
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron not available, skipping scheduled cleanup';
END;
$$;
