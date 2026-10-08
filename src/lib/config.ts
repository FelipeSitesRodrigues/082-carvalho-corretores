import type { ConfigImobiliaria } from './tipos'

/**
 * Dados da imobiliária.
 *
 * Telefone e CRECI são os DE EXEMPLO do mockup aprovado (o Marcos ainda não
 * passou os reais). Por isso `dadosDeExemplo: true`: o JSON-LD não publica
 * esses dois campos e o site não é indexado (NEXT_PUBLIC_INDEXAR=false).
 *
 * Com o Supabase ligado, a linha `config.imobiliaria` do banco sobrescreve
 * este objeto campo a campo (ver src/lib/dados/supabase.ts).
 */
export const CONFIG_PADRAO: ConfigImobiliaria = {
  nome: 'Carvalho Corretores',
  nomeCompleto: 'Carvalho Corretores de Imóveis',
  whatsapp: '5511900000000',
  whatsappExibicao: '(11) 90000-0000',
  creci: 'CRECI-SP 00000-J',
  cidade: 'Poá',
  uf: 'SP',
  regiao: 'Alto Tietê',
  endereco: 'Centro, Poá, SP',
  horarios: [
    { dias: 'Segunda a sexta', horas: '9h às 18h' },
    { dias: 'Sábado', horas: '9h às 13h' },
  ],
  instagram: null,
  facebook: null,
  taxaJurosAnual: 11,
  dadosDeExemplo: true,
}

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://carvalho-corretores.vercel.app').replace(/\/$/, '')

/** Só indexa quando os dados reais entrarem. Ver .env.example. */
export const INDEXAR = process.env.NEXT_PUBLIC_INDEXAR === 'true'
