-- Unified RBAC query to replace the 3-query waterfall pattern.
-- Returns all roles and permissions for a user in a single call.

CREATE OR REPLACE FUNCTION get_user_rbac(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'roles', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', r.id,
        'key', r.key,
        'name', r.name,
        'description', r.description,
        'level', r.level
      ))
      FROM user_roles ur
      JOIN roles r ON r.key = ur.role
      WHERE ur.user_id = p_user_id
    ), '[]'::jsonb),
    'permissions', COALESCE((
      SELECT jsonb_agg(DISTINCT jsonb_build_object(
        'id', p.id,
        'key', p.key,
        'name', p.name,
        'module', p.module,
        'category', p.category
      ))
      FROM user_roles ur
      JOIN roles r ON r.key = ur.role
      JOIN role_permissions rp ON rp.role_id = r.id
      JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = p_user_id
    ), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;
