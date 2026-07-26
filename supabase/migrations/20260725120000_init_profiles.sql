-- Fase 0 — fundação: profiles, criação automática no signup e RLS base.
--
-- DO NOT CHANGE (SPEC.md, Fase 0): nenhuma tabela de domínio (area, goal,
-- phase, deliverable, action) é criada nesta fase. Só profiles.
--
-- Nomenclatura em inglês no schema conforme AGENTS.md; a UI traduz via strings.

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text,
  timezone   text        not null default 'America/Sao_Paulo',
  -- Produto trilíngue (decisão da revisão de protótipo, ver AGENTS.md). Fica
  -- aqui e não só no cookie porque o idioma precisa sobreviver a troca de
  -- dispositivo e, na Fase 5, decidir em que língua a IA responde.
  locale     text        not null default 'pt'
             constraint profiles_locale_supported check (locale in ('pt', 'en', 'es')),
  created_at timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil do usuário. Um profile = um tenant completo — não existe workspace/organização nesta versão (SPEC.md, Não-Escopo).';

-- ---------------------------------------------------------------------------
-- RN-93 — RLS é a fronteira de tenant.
--
-- Habilitar RLS sem policy já nega tudo. As policies abaixo abrem apenas o
-- estritamente necessário, e sempre para a própria linha.
--
-- `force row level security` faz a regra valer inclusive para o dono da tabela,
-- de modo que nem uma conexão privilegiada acidental leia dado alheio sem
-- passar pela service role de propósito.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.profiles force row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

-- Visitante anônimo não enxerga nada. Sem policy para o role `anon`, toda query
-- dele retorna zero linhas — não erro, não dado de outro usuário.

-- ---------------------------------------------------------------------------
-- Criação automática do profile no signup
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
-- search_path vazio + nomes qualificados: sem isso, uma tabela plantada em um
-- schema no search_path poderia sequestrar esta função, que roda como owner.
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, locale)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'name', '')), ''),
    -- O idioma em que a pessoa se cadastrou é o melhor palpite inicial. Valor
    -- fora da lista cai no default em vez de estourar o check e derrubar o
    -- signup inteiro.
    case
      when new.raw_user_meta_data ->> 'locale' in ('pt', 'en', 'es')
        then new.raw_user_meta_data ->> 'locale'
      else 'pt'
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Cria a linha em profiles quando um usuário nasce em auth.users. Fase 0, critério de aceite 2.';

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
