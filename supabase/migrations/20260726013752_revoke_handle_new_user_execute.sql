-- handle_new_user() é SECURITY DEFINER e, por estar em `public`, o PostgREST a
-- expõe em /rest/v1/rpc/handle_new_user. Na prática a chamada falha (Postgres
-- recusa invocar função de retorno `trigger` fora de um trigger real), mas o
-- advisor de segurança do Supabase está certo em reclamar: não faz sentido
-- deixar EXECUTE liberado para anon/authenticated numa função que só deveria
-- rodar via trigger no schema auth.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
