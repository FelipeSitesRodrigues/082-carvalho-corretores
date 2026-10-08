-- ============================================================
-- Carvalho Corretores (082) - schema inicial
-- ============================================================
-- Mesmo desenho da 057 Ultra Veículos, adaptado pra imóvel:
--   1. RLS ligada em TODAS as tabelas, deny by default
--   2. imovel_privado (endereço completo, proprietário, valor mínimo,
--      comissão) NUNCA é legível pelo público: tabela separada, sem policy
--      pra anon e com o grant revogado
--   3. Painel único: quem tem perfil ativo vê tudo (role já existe pra
--      separar dono de corretor numa fase 2)
--   4. Lead do site entra por função RPC validada, nunca por insert direto
--
-- Ainda NÃO aplicada. Ver README.md, seção "Ligar o Supabase".
-- ============================================================

-- ------------------------------------------------------------
-- Helpers
-- ------------------------------------------------------------
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- perfis: quem entra no painel
-- ------------------------------------------------------------
create table public.perfis (
  id         uuid primary key references auth.users(id) on delete cascade,
  nome       text not null default '',
  role       text not null default 'admin' check (role in ('admin','corretor')),
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

alter table public.perfis enable row level security;

-- Cada um lê a própria linha. Ninguém muda a própria role pelo cliente:
-- promover ou rebaixar é feito no painel do Supabase, de propósito.
create policy "perfil proprio: ler"
  on public.perfis for select
  to authenticated
  using (id = (select auth.uid()));

-- Faz parte da equipe: tem perfil e está ativo. security definer pra ler
-- perfis de dentro das policies sem recursão de RLS.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis p
    where p.id = (select auth.uid()) and p.ativo
  );
$$;

revoke execute on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

-- ------------------------------------------------------------
-- bairros
-- ------------------------------------------------------------
create table public.bairros (
  slug          text primary key check (slug ~ '^[a-z0-9-]{2,60}$'),
  nome          text not null,
  foto_path     text,
  foto_largura  int,
  foto_altura   int,
  ordem         int not null default 0,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.bairros enable row level security;

create policy "bairros: publico le os ativos"
  on public.bairros for select
  to anon, authenticated
  using (ativo);

create policy "bairros: equipe gerencia"
  on public.bairros for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create trigger bairros_atualizado_em
  before update on public.bairros
  for each row execute function public.tocar_atualizado_em();

-- ------------------------------------------------------------
-- imoveis: a vitrine pública. NADA de dado do proprietário aqui.
-- ------------------------------------------------------------
create sequence public.imovel_codigo_seq start 101;

create table public.imoveis (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text not null unique check (slug ~ '^[a-z0-9-]{3,120}$'),
  -- código curto que o cliente cita no WhatsApp: CC-0101
  codigo               text not null unique
                       default ('CC-' || lpad(nextval('public.imovel_codigo_seq')::text, 4, '0')),
  status               text not null default 'rascunho'
                       check (status in ('rascunho','publicado','reservado','vendido','alugado','arquivado')),
  destaque             boolean not null default false,
  ordem                int not null default 0,

  finalidade           text not null check (finalidade in ('venda','aluguel')),
  tipo                 text not null default 'apartamento'
                       check (tipo in ('apartamento','casa','terreno','comercial')),
  titulo               text not null,
  bairro_slug          text references public.bairros(slug) on update cascade on delete set null,
  cidade               text not null default 'Poá',
  uf                   text not null default 'SP',

  -- dinheiro sempre em centavos; aluguel e custos são mensais
  preco_centavos       bigint not null default 0 check (preco_centavos >= 0),
  condominio_centavos  bigint check (condominio_centavos >= 0),
  iptu_centavos        bigint check (iptu_centavos >= 0),

  area_m2              numeric(9,2) not null default 0 check (area_m2 >= 0),
  quartos              smallint not null default 0 check (quartos between 0 and 20),
  suites               smallint not null default 0 check (suites between 0 and 20),
  banheiros            smallint not null default 0 check (banheiros between 0 and 20),
  vagas                smallint not null default 0 check (vagas between 0 and 20),

  descricao            text not null default '',
  caracteristicas      text[] not null default '{}',
  aceita_financiamento boolean not null default false,
  aceita_fgts          boolean not null default false,
  mobiliado            boolean not null default false,

  publicado_em         timestamptz,
  criado_em            timestamptz not null default now(),
  atualizado_em        timestamptz not null default now(),
  criado_por           uuid references auth.users(id) on delete set null
);

alter table public.imoveis enable row level security;

-- O público só enxerga o que está publicado. Reservado, vendido, alugado,
-- rascunho e arquivado ficam fora do site.
create policy "imoveis: publico le os publicados"
  on public.imoveis for select
  to anon, authenticated
  using (status = 'publicado');

create policy "imoveis: equipe gerencia"
  on public.imoveis for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create index imoveis_vitrine_idx on public.imoveis (status, destaque desc, ordem, publicado_em desc);
create index imoveis_filtro_idx on public.imoveis (finalidade, tipo, bairro_slug, quartos, preco_centavos);

create trigger imoveis_atualizado_em
  before update on public.imoveis
  for each row execute function public.tocar_atualizado_em();

-- publicado_em se preenche sozinho na primeira publicação
create or replace function public.marcar_publicado_em()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = 'publicado' and new.publicado_em is null then
    new.publicado_em := now();
  end if;
  return new;
end;
$$;

create trigger imoveis_publicado_em
  before insert or update of status on public.imoveis
  for each row execute function public.marcar_publicado_em();

-- ------------------------------------------------------------
-- imovel_privado: o que o visitante nunca vê.
-- TABELA SEPARADA DE PROPÓSITO (mesmo motivo do veiculo_financeiro da
-- 057): um select distraído no site não tem como trazer o endereço ou o
-- telefone do proprietário, porque eles não moram na tabela que o site lê.
-- ------------------------------------------------------------
create table public.imovel_privado (
  imovel_id               uuid primary key references public.imoveis(id) on delete cascade,
  endereco                text not null default '',
  complemento             text not null default '',
  proprietario_nome       text not null default '',
  proprietario_telefone   text not null default '',
  valor_minimo_centavos   bigint check (valor_minimo_centavos >= 0),
  comissao_pct            numeric(5,2) check (comissao_pct between 0 and 100),
  onde_esta_a_chave       text not null default '',
  observacoes             text not null default '',
  atualizado_em           timestamptz not null default now(),
  atualizado_por          uuid references auth.users(id) on delete set null
);

alter table public.imovel_privado enable row level security;

create policy "privado: so a equipe"
  on public.imovel_privado for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- cinto e suspensório: mesmo que alguém crie uma policy errada, anon não chega aqui
revoke all on public.imovel_privado from anon;

create trigger privado_atualizado_em
  before update on public.imovel_privado
  for each row execute function public.tocar_atualizado_em();

-- ------------------------------------------------------------
-- imovel_fotos (ordem 0 é a capa)
-- ------------------------------------------------------------
create table public.imovel_fotos (
  id         uuid primary key default gen_random_uuid(),
  imovel_id  uuid not null references public.imoveis(id) on delete cascade,
  path       text not null,             -- caminho no bucket "imoveis", não URL crua
  ordem      int not null default 0,
  largura    int,
  altura     int,
  alt        text not null default '',
  criado_em  timestamptz not null default now()
);

alter table public.imovel_fotos enable row level security;

create policy "fotos: publico le as de imovel publicado"
  on public.imovel_fotos for select
  to anon, authenticated
  using (exists (select 1 from public.imoveis i where i.id = imovel_id and i.status = 'publicado'));

create policy "fotos: equipe gerencia"
  on public.imovel_fotos for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create index imovel_fotos_imovel_idx on public.imovel_fotos (imovel_id, ordem);

-- ------------------------------------------------------------
-- leads: quem preencheu o formulário. Ninguém de fora lê nem escreve
-- direto: a escrita passa pela função registrar_lead.
-- ------------------------------------------------------------
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  telefone   text not null,
  interesse  text not null default 'comprar'
             check (interesse in ('comprar','alugar','vender','anunciar-aluguel','financiamento')),
  mensagem   text not null default '',
  imovel_id  uuid references public.imoveis(id) on delete set null,
  origem     text not null default 'contato' check (origem in ('contato','imovel','simulador')),
  atendido   boolean not null default false,
  ip_hash    text,                      -- hash diário, nunca o IP em claro
  user_agent text,
  criado_em  timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "leads: so a equipe"
  on public.leads for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

revoke all on public.leads from anon;

create index leads_criado_em_idx on public.leads (criado_em desc);
create index leads_ip_idx on public.leads (ip_hash, criado_em desc);

-- Porta única de entrada de lead: valida tamanho e formato, freia robô
-- (mais de 5 envios do mesmo IP na última hora) e só escreve nas colunas
-- que ela mesma preenche.
create or replace function public.registrar_lead(
  p_nome       text,
  p_telefone   text,
  p_interesse  text default 'comprar',
  p_mensagem   text default '',
  p_imovel_id  uuid default null,
  p_origem     text default 'contato',
  p_ip_hash    text default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id   uuid;
  v_nome text := btrim(coalesce(p_nome, ''));
  v_tel  text := regexp_replace(coalesce(p_telefone, ''), '[^0-9]', '', 'g');
begin
  if length(v_nome) < 2 or length(v_nome) > 120 then
    raise exception 'nome invalido';
  end if;
  if length(v_tel) < 10 or length(v_tel) > 15 then
    raise exception 'telefone invalido';
  end if;
  if length(coalesce(p_mensagem, '')) > 2000 then
    raise exception 'mensagem muito longa';
  end if;
  if p_interesse not in ('comprar','alugar','vender','anunciar-aluguel','financiamento') then
    raise exception 'interesse invalido';
  end if;
  if p_origem not in ('contato','imovel','simulador') then
    raise exception 'origem invalida';
  end if;
  if p_ip_hash is not null and (
    select count(*) from public.leads l
    where l.ip_hash = p_ip_hash and l.criado_em > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'muitos envios';
  end if;

  insert into public.leads (nome, telefone, interesse, mensagem, imovel_id, origem, ip_hash, user_agent)
  values (
    v_nome,
    v_tel,
    p_interesse,
    left(btrim(coalesce(p_mensagem, '')), 2000),
    p_imovel_id,
    p_origem,
    left(coalesce(p_ip_hash, ''), 64),
    left(coalesce(p_user_agent, ''), 300)
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.registrar_lead(text,text,text,text,uuid,text,text,text)
  to anon, authenticated;

-- ------------------------------------------------------------
-- config: dados da imobiliária e taxa do simulador
-- ------------------------------------------------------------
create table public.config (
  chave         text primary key,
  valor         jsonb not null,
  publica       boolean not null default false,
  atualizado_em timestamptz not null default now()
);

alter table public.config enable row level security;

-- Só o que estiver marcado como público sai pro site.
create policy "config: publico le so o que e publico"
  on public.config for select
  to anon, authenticated
  using (publica);

create policy "config: equipe gerencia"
  on public.config for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create trigger config_atualizado_em
  before update on public.config
  for each row execute function public.tocar_atualizado_em();

-- ------------------------------------------------------------
-- Storage: fotos dos imóveis e dos bairros.
-- Leitura pública (são fotos de anúncio), escrita só da equipe.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imoveis', 'imoveis', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy "storage: leitura publica das fotos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'imoveis');

create policy "storage: equipe envia"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'imoveis' and public.is_staff());

create policy "storage: equipe atualiza"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'imoveis' and public.is_staff())
  with check (bucket_id = 'imoveis' and public.is_staff());

create policy "storage: equipe apaga"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'imoveis' and public.is_staff());
