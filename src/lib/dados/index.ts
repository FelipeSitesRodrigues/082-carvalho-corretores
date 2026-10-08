import 'server-only'
import { cache } from 'react'
import { supabaseConfigurado } from '../supabase/ambiente'
import { CONFIG_PADRAO } from '../config'
import { criarDemo } from './demo'
import fotos from './fotos.gerado.json'
import type { Bairro, ConfigImobiliaria, Foto, Imovel } from '../tipos'

const { bairros: BAIRROS_DEMO, imoveis: IMOVEIS_DEMO } = criarDemo(fotos as Record<string, Foto[]>)

/**
 * Porta única de leitura do site. Toda página lê daqui e nada mais.
 *
 * Sem Supabase: devolve a demonstração (dados/demo.ts).
 * Com Supabase: lê do banco (dados/supabase.ts), com o mesmo formato.
 *
 * O import do Supabase é dinâmico para o cliente nem entrar no build quando
 * o banco não está ligado.
 */

const banco = () => import('./supabase')

const ordenar = (lista: Imovel[]) =>
  [...lista].sort((a, b) => Number(b.destaque) - Number(a.destaque) || b.publicadoEm.localeCompare(a.publicadoEm))

export const listarImoveis = cache(async (): Promise<Imovel[]> => {
  if (!supabaseConfigurado()) return ordenar(IMOVEIS_DEMO.filter((i) => i.status === 'publicado'))
  return (await banco()).imoveisPublicados()
})

export async function listarDestaques(limite = 4): Promise<Imovel[]> {
  const todos = await listarImoveis()
  const destaques = todos.filter((i) => i.destaque)
  return (destaques.length >= limite ? destaques : [...destaques, ...todos.filter((i) => !i.destaque)]).slice(0, limite)
}

export const buscarImovel = cache(async (slug: string): Promise<Imovel | null> => {
  if (!supabaseConfigurado()) return IMOVEIS_DEMO.find((i) => i.slug === slug && i.status === 'publicado') ?? null
  return (await banco()).imovelPorSlug(slug)
})

export async function imoveisParecidos(imovel: Imovel, limite = 3): Promise<Imovel[]> {
  const todos = (await listarImoveis()).filter((i) => i.id !== imovel.id)
  const pontos = (i: Imovel) =>
    (i.finalidade === imovel.finalidade ? 4 : 0) + (i.bairro.slug === imovel.bairro.slug ? 2 : 0) + (i.tipo === imovel.tipo ? 1 : 0)
  return todos.sort((a, b) => pontos(b) - pontos(a)).slice(0, limite)
}

export const listarBairros = cache(async (): Promise<Bairro[]> => {
  if (!supabaseConfigurado()) return BAIRROS_DEMO
  return (await banco()).bairrosAtivos()
})

export const buscarConfig = cache(async (): Promise<ConfigImobiliaria> => {
  if (!supabaseConfigurado()) return CONFIG_PADRAO
  return (await banco()).configDoBanco()
})
