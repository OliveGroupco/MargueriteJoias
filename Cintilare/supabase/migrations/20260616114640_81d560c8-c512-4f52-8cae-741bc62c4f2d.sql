
-- Move SECURITY DEFINER functions out of API-exposed public schema
CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA app_private TO postgres, service_role, authenticated, anon;

-- Recreate has_role in app_private
CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

-- Keep public.has_role as a thin SECURITY INVOKER wrapper so app code using rpc('has_role') keeps working
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public
AS $$
  SELECT app_private.has_role(_user_id, _role)
$$;

-- Rebuild policies to reference app_private.has_role (avoid public SECURITY DEFINER exposure)
DROP POLICY IF EXISTS "admins manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins see all roles" ON public.user_roles;
DROP POLICY IF EXISTS "admins manage categorias" ON public.categorias;
DROP POLICY IF EXISTS "admins manage produtos" ON public.produtos;
DROP POLICY IF EXISTS "anyone can read active produtos" ON public.produtos;
DROP POLICY IF EXISTS "admins manage cupons" ON public.cupons;
DROP POLICY IF EXISTS "admins manage pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "anyone can insert pedido" ON public.pedidos;

CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "admins see all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (app_private.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "admins manage categorias" ON public.categorias FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "admins manage produtos" ON public.produtos FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "anyone can read active produtos" ON public.produtos FOR SELECT TO anon, authenticated
  USING (ativo = true OR app_private.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "admins manage cupons" ON public.cupons FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(),'admin'::app_role));

CREATE POLICY "admins manage pedidos" ON public.pedidos FOR ALL TO authenticated
  USING (app_private.has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(),'admin'::app_role));

-- Tighten guest checkout insert: require minimum valid order data instead of WITH CHECK (true)
CREATE POLICY "anyone can insert pedido" ON public.pedidos FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(btrim(cliente_nome)) >= 2
    AND jsonb_typeof(itens) = 'array'
    AND jsonb_array_length(itens) > 0
    AND valor_total >= 0
    AND status = 'novo'::order_status
  );

-- Lock down trigger-only helper functions (not meant to be called via RPC)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
