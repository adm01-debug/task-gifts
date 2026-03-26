-- Atomic profile operations to prevent race conditions on concurrent updates.
-- These functions use UPDATE ... SET col = col + amount (atomic at DB level)
-- instead of the vulnerable read-modify-write pattern.

-- Atomically add XP and recalculate level
CREATE OR REPLACE FUNCTION add_xp_atomic(p_user_id UUID, p_amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_xp INT;
  v_old_level INT;
  v_new_xp INT;
  v_new_level INT;
BEGIN
  -- Lock the row and get current values
  SELECT xp, level INTO v_old_xp, v_old_level
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found: %', p_user_id;
  END IF;

  v_new_xp := GREATEST(0, v_old_xp + p_amount);
  v_new_level := FLOOR(v_new_xp / 1000) + 1;

  UPDATE profiles
  SET xp = v_new_xp,
      level = v_new_level,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'old_xp', v_old_xp,
    'new_xp', v_new_xp,
    'old_level', v_old_level,
    'new_level', v_new_level,
    'leveled_up', v_new_level > v_old_level
  );
END;
$$;

-- Atomically add coins
CREATE OR REPLACE FUNCTION add_coins_atomic(p_user_id UUID, p_amount INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_coins INT;
  v_new_coins INT;
BEGIN
  SELECT coins INTO v_old_coins
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found: %', p_user_id;
  END IF;

  v_new_coins := GREATEST(0, v_old_coins + p_amount);

  UPDATE profiles
  SET coins = v_new_coins,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'old_coins', v_old_coins,
    'new_coins', v_new_coins
  );
END;
$$;

-- Atomically increment streak and update best_streak
CREATE OR REPLACE FUNCTION increment_streak_atomic(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_streak INT;
  v_new_streak INT;
  v_best_streak INT;
BEGIN
  SELECT streak, best_streak INTO v_old_streak, v_best_streak
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found: %', p_user_id;
  END IF;

  v_new_streak := v_old_streak + 1;
  v_best_streak := GREATEST(v_best_streak, v_new_streak);

  UPDATE profiles
  SET streak = v_new_streak,
      best_streak = v_best_streak,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'old_streak', v_old_streak,
    'new_streak', v_new_streak,
    'best_streak', v_best_streak
  );
END;
$$;

-- Atomically increment quests_completed
CREATE OR REPLACE FUNCTION increment_quests_completed_atomic(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_count INT;
BEGIN
  SELECT quests_completed INTO v_old_count
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found: %', p_user_id;
  END IF;

  UPDATE profiles
  SET quests_completed = v_old_count + 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'old_count', v_old_count,
    'new_count', v_old_count + 1
  );
END;
$$;

-- Atomic reward granting (used by edge functions instead of supabase.raw)
CREATE OR REPLACE FUNCTION add_user_rewards(p_user_id UUID, p_xp INT DEFAULT 0, p_coins INT DEFAULT 0)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_xp INT;
  v_old_coins INT;
  v_new_xp INT;
  v_new_coins INT;
  v_new_level INT;
BEGIN
  SELECT xp, coins INTO v_old_xp, v_old_coins
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found: %', p_user_id;
  END IF;

  v_new_xp := GREATEST(0, v_old_xp + p_xp);
  v_new_coins := GREATEST(0, v_old_coins + p_coins);
  v_new_level := FLOOR(v_new_xp / 1000) + 1;

  UPDATE profiles
  SET xp = v_new_xp,
      coins = v_new_coins,
      level = v_new_level,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'old_xp', v_old_xp,
    'new_xp', v_new_xp,
    'old_coins', v_old_coins,
    'new_coins', v_new_coins,
    'new_level', v_new_level
  );
END;
$$;

-- Add database-level constraints for profile fields
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_xp_non_negative') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_xp_non_negative CHECK (xp >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_coins_non_negative') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_coins_non_negative CHECK (coins >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_level_valid') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_level_valid CHECK (level >= 1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_streak_non_negative') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_streak_non_negative CHECK (streak >= 0);
  END IF;
END;
$$;
