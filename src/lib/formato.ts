import type { Imovel } from './tipos'

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const NUM = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })

/** R$ 320.000 (sem centavos; o Intl põe espaço fino depois do R$, trocado por espaço comum). */
export const moeda = (v: number) => BRL.format(v).replace(/\s/g, ' ')
export const numero = (v: number) => NUM.format(v)

/** "R$ 1.500 / mês" no aluguel, "R$ 320.000" na venda. */
export function precoImovel(i: Pick<Imovel, 'preco' | 'finalidade'>): { valor: string; sufixo: string | null } {
  return { valor: moeda(i.preco), sufixo: i.finalidade === 'aluguel' ? '/ mês' : null }
}

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

export function linkWhatsApp(numeroWhats: string, mensagem: string): string {
  return `https://wa.me/${numeroWhats.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`
}

export const MENSAGEM_GERAL = 'Olá! Vim pelo site da Carvalho Corretores e quero ajuda para encontrar um imóvel.'

export function mensagemImovel(i: Pick<Imovel, 'titulo' | 'codigo' | 'finalidade'>): string {
  const acao = i.finalidade === 'aluguel' ? 'alugar' : 'comprar'
  return `Olá! Vi no site o imóvel "${i.titulo}" (cód. ${i.codigo}) e tenho interesse em ${acao}. Pode me passar mais informações?`
}

export function mensagemVisita(i: Pick<Imovel, 'titulo' | 'codigo'>): string {
  return `Olá! Quero agendar uma visita ao imóvel "${i.titulo}" (cód. ${i.codigo}). Quais horários vocês têm?`
}

export const rotuloTipo: Record<Imovel['tipo'], string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  terreno: 'Terreno',
  comercial: 'Comercial',
}
