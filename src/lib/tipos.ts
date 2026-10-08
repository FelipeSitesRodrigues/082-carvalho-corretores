/**
 * Tipos do domínio. São os mesmos nos dois modos de dados (demonstração e
 * Supabase): as páginas não sabem de onde o imóvel veio.
 */

export type Finalidade = 'venda' | 'aluguel'
export type TipoImovel = 'apartamento' | 'casa' | 'terreno' | 'comercial'
export type StatusImovel = 'rascunho' | 'publicado' | 'reservado' | 'vendido' | 'alugado' | 'arquivado'

/**
 * Uma foto pronta pra <picture>. No modo demonstração as larguras e formatos
 * saem do scripts/processar-imagens.mjs. No Supabase vem o arquivo único que o
 * painel enviou (já reduzido no navegador, como na 057), sem srcset.
 */
export type Foto = {
  src: string
  largura: number
  altura: number
  alt: string
  /** "url 480w, url 800w" em WebP */
  srcSetWebp?: string
  /** "url 480w, url 800w" em AVIF */
  srcSetAvif?: string
}

export type Bairro = {
  slug: string
  nome: string
  foto: Foto | null
  ordem: number
}

export type Imovel = {
  id: string
  slug: string
  /** Código curto pra cliente citar no WhatsApp, ex.: CC-0001 */
  codigo: string
  status: StatusImovel
  destaque: boolean
  finalidade: Finalidade
  tipo: TipoImovel
  titulo: string
  bairro: { slug: string; nome: string }
  cidade: string
  uf: string
  /** Em reais. Aluguel é o valor mensal. */
  preco: number
  condominio: number | null
  iptu: number | null
  areaM2: number
  quartos: number
  suites: number
  banheiros: number
  vagas: number
  descricao: string
  caracteristicas: string[]
  aceitaFinanciamento: boolean
  aceitaFgts: boolean
  mobiliado: boolean
  fotos: Foto[]
  publicadoEm: string
}

export type Horario = { dias: string; horas: string }

export type ConfigImobiliaria = {
  nome: string
  nomeCompleto: string
  /** Só dígitos com DDI, ex.: 5511900000000 */
  whatsapp: string
  whatsappExibicao: string
  creci: string
  cidade: string
  uf: string
  regiao: string
  endereco: string
  horarios: Horario[]
  instagram: string | null
  facebook: string | null
  /** Taxa de referência do simulador, % ao ano */
  taxaJurosAnual: number
  /**
   * true enquanto telefone e CRECI forem os de exemplo do mockup. Esconde
   * esses dados do JSON-LD (dado estruturado falso confunde o Google).
   */
  dadosDeExemplo: boolean
}

export type FiltrosImoveis = {
  finalidade?: Finalidade
  tipo?: TipoImovel
  bairro?: string
  quartosMin?: number
  precoMax?: number
}
