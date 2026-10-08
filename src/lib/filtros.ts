import type { Finalidade, Imovel, TipoImovel } from './tipos'

/**
 * Filtros da lista de imóveis, lidos e escritos no endereço
 * (/imoveis?finalidade=venda&bairro=centro&quartos=2&ate=400000&ordem=menor-preco),
 * pra busca poder ser compartilhada no WhatsApp e o voltar do navegador funcionar.
 */
export type Ordem = 'recentes' | 'menor-preco' | 'maior-preco' | 'maior-area'

export type Filtros = {
  finalidade: Finalidade | ''
  tipo: TipoImovel | ''
  bairro: string
  quartos: number
  ate: number
  ordem: Ordem
}

export const FILTROS_VAZIOS: Filtros = { finalidade: '', tipo: '', bairro: '', quartos: 0, ate: 0, ordem: 'recentes' }

export const TETOS: Record<'venda' | 'aluguel', number[]> = {
  venda: [300000, 400000, 500000, 700000, 1000000],
  aluguel: [1200, 1500, 2000, 3000],
}

export function lerFiltros(p: URLSearchParams): Filtros {
  const fin = p.get('finalidade')
  const tipo = p.get('tipo')
  const ordem = p.get('ordem') as Ordem | null
  return {
    finalidade: fin === 'venda' || fin === 'aluguel' ? fin : '',
    tipo: tipo === 'apartamento' || tipo === 'casa' || tipo === 'terreno' || tipo === 'comercial' ? tipo : '',
    bairro: (p.get('bairro') ?? '').replace(/[^a-z0-9-]/g, '').slice(0, 60),
    quartos: Math.min(5, Math.max(0, Number(p.get('quartos')) || 0)),
    ate: Math.max(0, Number(p.get('ate')) || 0),
    ordem: ordem && ['recentes', 'menor-preco', 'maior-preco', 'maior-area'].includes(ordem) ? ordem : 'recentes',
  }
}

export function escreverFiltros(f: Filtros): string {
  const p = new URLSearchParams()
  if (f.finalidade) p.set('finalidade', f.finalidade)
  if (f.tipo) p.set('tipo', f.tipo)
  if (f.bairro) p.set('bairro', f.bairro)
  if (f.quartos) p.set('quartos', String(f.quartos))
  if (f.ate) p.set('ate', String(f.ate))
  if (f.ordem !== 'recentes') p.set('ordem', f.ordem)
  const q = p.toString()
  return q ? `?${q}` : ''
}

export function aplicarFiltros(lista: Imovel[], f: Filtros): Imovel[] {
  const saida = lista.filter(
    (i) =>
      (!f.finalidade || i.finalidade === f.finalidade) &&
      (!f.tipo || i.tipo === f.tipo) &&
      (!f.bairro || i.bairro.slug === f.bairro) &&
      (!f.quartos || i.quartos >= f.quartos) &&
      // teto de preço só vale quando a finalidade está escolhida (aluguel e venda não se comparam)
      (!f.ate || !f.finalidade || i.preco <= f.ate),
  )
  switch (f.ordem) {
    case 'menor-preco':
      return saida.sort((a, b) => a.preco - b.preco)
    case 'maior-preco':
      return saida.sort((a, b) => b.preco - a.preco)
    case 'maior-area':
      return saida.sort((a, b) => b.areaM2 - a.areaM2)
    default:
      return saida
  }
}

export const contarAtivos = (f: Filtros) =>
  [f.finalidade, f.tipo, f.bairro, f.quartos, f.finalidade ? f.ate : 0].filter(Boolean).length
