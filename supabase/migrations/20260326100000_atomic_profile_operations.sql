-- Atomic profile operations to prevent race conditions on concurrent updates.
-- These functions use SELECT ... FOR UPDATE (atomic at DB level)
-- instead of the vulnerable read-modify-write pattern.
--
-- Authorization: Functions that modify user profiles verify that the caller
-- is either the profile owner or an admin. Edge Functions using service_role
-- bypass auth.uid() so they work without this check (SECURITY DEFINER).

-- Helper: Check if caller is authorized to modify a profile
CREATE OR REPLACE FUNCTION _check_profile_access(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Service role calls (from Edge Functions) have no auth.uid(), allow them
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  -- Users can modify their own profile
  IF auth.uid() = p_user_id THEN
    RETURN;
  END IF;
  -- Admins can modify any profile
  IF EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN;
  END IF;
  RAISE EXCEPTION 'Unauthorized: cannot modify profile %', p_user_id;
END;
$$;

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
  PERFORM _check_profile_access(p_user_id);

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
  PERFORM _check_profile_access(p_user_id);

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
  PERFORM _check_profile_access(p_user_id);

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
  PERFORM _check_profile_access(p_user_id);

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
  PERFORM _check_profile_access(p_user_id);

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

-- Atomic shop purchase (prevents double-spend race condition)
CREATE OR REPLACE FUNCTION purchase_reward_atomic(
  p_user_id UUID,
  p_reward_id UUID,
  p_quantity INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reward RECORD;
  v_user_coins INT;
  v_total_cost INT;
BEGIN
  PERFORM _check_profile_access(p_user_id);

  IF p_quantity <= 0 OR p_quantity > 100 THEN
    RAISE EXCEPTION 'Invalid quantity: must be between 1 and 100';
  END IF;

  -- Lock reward row
  SELECT id, name, cost, stock, is_active INTO v_reward
  FROM shop_rewards
  WHERE id = p_reward_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found';
  END IF;

  IF NOT v_reward.is_active THEN
    RAISE EXCEPTION 'Reward is not available';
  END IF;

  IF v_reward.stock IS NOT NULL AND v_reward.stock < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;

  v_total_cost := v_reward.cost * p_quantity;

  -- Lock user row and check balance
  SELECT coins INTO v_user_coins
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF v_user_coins < v_total_cost THEN
    RAISE EXCEPTION 'Insufficient coins: need %, have %', v_total_cost, v_user_coins;
  END IF;

  -- Deduct coins
  UPDATE profiles
  SET coins = coins - v_total_cost, updated_at = NOW()
  WHERE id = p_user_id;

  -- Deduct stock if tracked
  IF v_reward.stock IS NOT NULL THEN
    UPDATE shop_rewards
    SET stock = stock - p_quantity
    WHERE id = p_reward_id;
  END IF;

  -- Create purchase record
  INSERT INTO shop_purchases (user_id, reward_id, quantity, total_cost, status)
  VALUES (p_user_id, p_reward_id, p_quantity, v_total_cost, 'pending');

  RETURN jsonb_build_object(
    'success', true,
    'reward_name', v_reward.name,
    'quantity', p_quantity,
    'total_cost', v_total_cost,
    'remaining_coins', v_user_coins - v_total_cost
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
