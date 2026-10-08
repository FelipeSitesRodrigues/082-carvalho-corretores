import 'server-only'
import { criarClientePublico, urlDaFoto } from '../supabase/publico'
import { CONFIG_PADRAO } from '../config'
import type { Bairro, ConfigImobiliaria, Foto, Imovel } from '../tipos'

/**
 * Leituras do Supabase. Só roda quando NEXT_PUBLIC_SUPABASE_URL e a anon key
 * existem (ver dados/index.ts). Converte as linhas do banco (snake_case,
 * dinheiro em centavos) para os tipos do site.
 */

const CAMPOS_IMOVEL = `
  id, slug, codigo, status, destaque, finalidade, tipo, titulo, cidade, uf,
  preco_centavos, condominio_centavos, iptu_centavos, area_m2, quartos, suites,
  banheiros, vagas, descricao, caracteristicas, aceita_financiamento, aceita_fgts,
  mobiliado, publicado_em,
  bairro:bairros(slug, nome),
  imovel_fotos(path, ordem, largura, altura, alt)
`

type LinhaFoto = { path: string; ordem: number; largura: number | null; altura: number | null; alt: string }
type LinhaImovel = {
  id: string
  slug: string
  codigo: string
  status: Imovel['status']
  destaque: boolean
  finalidade: Imovel['finalidade']
  tipo: Imovel['tipo']
  titulo: string
  cidade: string
  uf: string
  preco_centavos: number
  condominio_centavos: number | null
  iptu_centavos: number | null
  area_m2: number
  quartos: number
  suites: number
  banheiros: number
  vagas: number
  descricao: string
  caracteristicas: string[]
  aceita_financiamento: boolean
  aceita_fgts: boolean
  mobiliado: boolean
  publicado_em: string | null
  bairro: { slug: string; nome: string } | null
  imovel_fotos: LinhaFoto[] | null
}

const reais = (c: number | null) => (c == null ? null : Math.round(c) / 100)

function paraFoto(f: LinhaFoto, titulo: string): Foto {
  return {
    src: urlDaFoto(f.path),
    largura: f.largura ?? 1600,
    altura: f.altura ?? 1067,
    alt: f.alt || titulo,
  }
}

function paraImovel(l: LinhaImovel): Imovel {
  const fotos = [...(l.imovel_fotos ?? [])].sort((a, b) => a.ordem - b.ordem).map((f) => paraFoto(f, l.titulo))
  return {
    id: l.id,
    slug: l.slug,
    codigo: l.codigo,
    status: l.status,
    destaque: l.destaque,
    finalidade: l.finalidade,
    tipo: l.tipo,
    titulo: l.titulo,
    bairro: l.bairro ?? { slug: '', nome: '' },
    cidade: l.cidade,
    uf: l.uf,
    preco: reais(l.preco_centavos) ?? 0,
    condominio: reais(l.condominio_centavos),
    iptu: reais(l.iptu_centavos),
    areaM2: Number(l.area_m2),
    quartos: l.quartos,
    suites: l.suites,
    banheiros: l.banheiros,
    vagas: l.vagas,
    descricao: l.descricao,
    caracteristicas: l.caracteristicas ?? [],
    aceitaFinanciamento: l.aceita_financiamento,
    aceitaFgts: l.aceita_fgts,
    mobiliado: l.mobiliado,
    fotos,
    publicadoEm: l.publicado_em ?? '',
  }
}

export async function imoveisPublicados(): Promise<Imovel[]> {
  const { data, error } = await criarClientePublico()
    .from('imoveis')
    .select(CAMPOS_IMOVEL)
    .eq('status', 'publicado')
    .order('destaque', { ascending: false })
    .order('ordem', { ascending: true })
    .order('publicado_em', { ascending: false })
  if (error) {
    console.error('imoveisPublicados', error.message)
    return []
  }
  return (data as unknown as LinhaImovel[]).map(paraImovel)
}

export async function imovelPorSlug(slug: string): Promise<Imovel | null> {
  const { data, error } = await criarClientePublico()
    .from('imoveis')
    .select(CAMPOS_IMOVEL)
    .eq('status', 'publicado')
    .eq('slug', slug)
    .maybeSingle()
  if (error) {
    console.error('imovelPorSlug', error.message)
    return null
  }
  return data ? paraImovel(data as unknown as LinhaImovel) : null
}

export async function bairrosAtivos(): Promise<Bairro[]> {
  const { data, error } = await criarClientePublico()
    .from('bairros')
    .select('slug, nome, foto_path, foto_largura, foto_altura, ordem')
    .eq('ativo', true)
    .order('ordem')
  if (error) {
    console.error('bairrosAtivos', error.message)
    return []
  }
  return (data ?? []).map((b) => ({
    slug: b.slug,
    nome: b.nome,
    ordem: b.ordem,
    foto: b.foto_path
      ? { src: urlDaFoto(b.foto_path), largura: b.foto_largura ?? 800, altura: b.foto_altura ?? 700, alt: `Rua do bairro ${b.nome}, em Poá` }
      : null,
  }))
}

export async function configDoBanco(): Promise<ConfigImobiliaria> {
  const { data, error } = await criarClientePublico()
    .from('config')
    .select('valor')
    .eq('chave', 'imobiliaria')
    .maybeSingle()
  if (error || !data) return CONFIG_PADRAO
  return { ...CONFIG_PADRAO, ...(data.valor as Partial<ConfigImobiliaria>) }
}
