import type { Bairro, Foto, Imovel } from '../tipos.ts'

/**
 * Imóveis de DEMONSTRAÇÃO.
 *
 * Os quatro primeiros são os do mockup aprovado (mesmo bairro, metragem,
 * quartos, vagas e preço). Os outros quatro vêm do prompt do mockup
 * (sites/082 - Carvalho Corretores/prompt-mockup.md), com preço dentro do que
 * os portais mostravam para Poá em 2026-10-07. Fotos de banco (Unsplash),
 * créditos em Recursos Site/FOTOS DEMO/creditos.json.
 *
 * Quando o Supabase entrar, este arquivo vira o seed (scripts/gerar-seed.mjs
 * escreve supabase/seed.sql) e o site passa a ler do banco.
 *
 * Recebe o manifesto de fotos de fora (dados/index.ts) pra também rodar no
 * Node puro, sem o bundler, no gerador do seed.
 */
export function criarDemo(FOTOS: Record<string, Foto[]>): { bairros: Bairro[]; imoveis: Imovel[] } {
const fotos = (chave: string): Foto[] => FOTOS[chave] ?? []
const foto = (chave: string): Foto | null => FOTOS[chave]?.[0] ?? null

const BAIRROS_DEMO: Bairro[] = [
  { slug: 'centro', nome: 'Centro', foto: foto('bairros/bairro-centro'), ordem: 1 },
  { slug: 'vila-perracini', nome: 'Vila Perracini', foto: foto('bairros/bairro-vila-perracini'), ordem: 2 },
  { slug: 'calmon-viana', nome: 'Calmon Viana', foto: foto('bairros/bairro-calmon-viana'), ordem: 3 },
  { slug: 'jardim-america', nome: 'Jardim América', foto: foto('bairros/bairro-jardim-america'), ordem: 4 },
  { slug: 'vila-amelia', nome: 'Vila Amélia', foto: foto('bairros/bairro-vila-amelia'), ordem: 5 },
  { slug: 'vila-julia', nome: 'Vila Júlia', foto: foto('bairros/bairro-vila-julia'), ordem: 6 },
]

const bairro = (slug: string) => {
  const b = BAIRROS_DEMO.find((x) => x.slug === slug)
  if (!b) throw new Error(`bairro desconhecido: ${slug}`)
  return { slug: b.slug, nome: b.nome }
}

const base = {
  status: 'publicado' as const,
  cidade: 'Poá',
  uf: 'SP',
  iptu: null,
  suites: 0,
  aceitaFinanciamento: false,
  aceitaFgts: false,
  mobiliado: false,
}

const IMOVEIS_DEMO: Imovel[] = [
  {
    ...base,
    id: 'demo-01',
    slug: 'apartamento-2-quartos-centro-poa',
    codigo: 'CC-0101',
    destaque: true,
    finalidade: 'venda',
    tipo: 'apartamento',
    titulo: 'Apartamento no Centro',
    bairro: bairro('centro'),
    preco: 320000,
    condominio: null,
    areaM2: 56,
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    aceitaFinanciamento: true,
    aceitaFgts: true,
    descricao:
      'Apartamento de 56 m² no Centro de Poá, com dois quartos, sala integrada à cozinha e uma vaga de garagem. Perto do comércio, da estação e dos serviços do centro, para quem quer resolver tudo a pé.',
    caracteristicas: ['Sala integrada à cozinha', 'Quartos com janela ampla', 'Área de serviço', 'Portaria'],
    fotos: fotos('imoveis/01-apto-centro'),
    publicadoEm: '2026-10-04',
  },
  {
    ...base,
    id: 'demo-02',
    slug: 'apartamento-2-quartos-aluguel-vila-perracini-poa',
    codigo: 'CC-0102',
    destaque: true,
    finalidade: 'aluguel',
    tipo: 'apartamento',
    titulo: 'Apartamento na Vila Perracini',
    bairro: bairro('vila-perracini'),
    preco: 1500,
    condominio: null,
    areaM2: 48,
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    descricao:
      'Apartamento de 48 m² para alugar na Vila Perracini, com dois quartos, cozinha integrada e uma vaga. Bairro residencial, tranquilo e perto do centro de Poá.',
    caracteristicas: ['Cozinha integrada', 'Varanda', 'Área de serviço', 'Bicicletário'],
    fotos: fotos('imoveis/02-apto-vila-perracini'),
    publicadoEm: '2026-10-03',
  },
  {
    ...base,
    id: 'demo-03',
    slug: 'casa-3-quartos-calmon-viana-poa',
    codigo: 'CC-0103',
    destaque: true,
    finalidade: 'venda',
    tipo: 'casa',
    titulo: 'Casa no Calmon Viana',
    bairro: bairro('calmon-viana'),
    preco: 450000,
    condominio: null,
    areaM2: 125,
    quartos: 3,
    suites: 1,
    banheiros: 2,
    vagas: 2,
    aceitaFinanciamento: true,
    aceitaFgts: true,
    descricao:
      'Casa térrea de 125 m² no Calmon Viana, com três quartos (um suíte), duas vagas e quintal. A poucos minutos da estação Calmon Viana, que liga Poá a São Paulo pelas linhas 11 e 12 da CPTM.',
    caracteristicas: ['Suíte', 'Quintal', 'Garagem para 2 carros', 'Cozinha planejada'],
    fotos: fotos('imoveis/03-casa-calmon-viana'),
    publicadoEm: '2026-10-02',
  },
  {
    ...base,
    id: 'demo-04',
    slug: 'apartamento-2-quartos-aluguel-vila-julia-poa',
    codigo: 'CC-0104',
    destaque: true,
    finalidade: 'aluguel',
    tipo: 'apartamento',
    titulo: 'Apartamento na Vila Júlia',
    bairro: bairro('vila-julia'),
    preco: 1300,
    condominio: null,
    areaM2: 52,
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    descricao:
      'Apartamento de 52 m² para alugar na Vila Júlia, com sala integrada, dois quartos e uma vaga. Prédio em rua residencial, com luz natural o dia todo.',
    caracteristicas: ['Sala integrada', 'Janelas amplas', 'Área de serviço', 'Portão eletrônico'],
    fotos: fotos('imoveis/04-apto-vila-julia'),
    publicadoEm: '2026-10-01',
  },
  {
    ...base,
    id: 'demo-05',
    slug: 'apartamento-3-quartos-varanda-gourmet-centro-poa',
    codigo: 'CC-0105',
    destaque: false,
    finalidade: 'venda',
    tipo: 'apartamento',
    titulo: 'Apartamento com varanda gourmet no Centro',
    bairro: bairro('centro'),
    preco: 620000,
    condominio: 690,
    areaM2: 78,
    quartos: 3,
    suites: 1,
    banheiros: 2,
    vagas: 2,
    aceitaFinanciamento: true,
    aceitaFgts: true,
    descricao:
      'Apartamento de 78 m² no Centro de Poá, com três quartos (um suíte), varanda gourmet integrada à sala e duas vagas. Condomínio com lazer.',
    caracteristicas: ['Varanda gourmet', 'Suíte', 'Lazer no condomínio', 'Portaria 24 horas'],
    fotos: fotos('imoveis/05-apto-centro-varanda'),
    publicadoEm: '2026-09-28',
  },
  {
    ...base,
    id: 'demo-06',
    slug: 'apartamento-2-quartos-aluguel-jardim-america-poa',
    codigo: 'CC-0106',
    destaque: false,
    finalidade: 'aluguel',
    tipo: 'apartamento',
    titulo: 'Apartamento no Jardim América',
    bairro: bairro('jardim-america'),
    preco: 1550,
    condominio: 150,
    areaM2: 50,
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    descricao:
      'Apartamento de 50 m² para alugar no Jardim América, com cozinha americana planejada, dois quartos e uma vaga. Condomínio baixo.',
    caracteristicas: ['Cozinha americana planejada', 'Condomínio baixo', 'Área de serviço'],
    fotos: fotos('imoveis/06-apto-jardim-america'),
    publicadoEm: '2026-09-27',
  },
  {
    ...base,
    id: 'demo-07',
    slug: 'apartamento-2-quartos-aluguel-vila-amelia-poa',
    codigo: 'CC-0107',
    destaque: false,
    finalidade: 'aluguel',
    tipo: 'apartamento',
    titulo: 'Apartamento na Vila Amélia',
    bairro: bairro('vila-amelia'),
    preco: 1250,
    condominio: 250,
    areaM2: 48,
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    descricao:
      'Apartamento de 48 m² para alugar na Vila Amélia, com dois quartos claros, sala, cozinha e uma vaga.',
    caracteristicas: ['Quartos claros', 'Área de serviço', 'Portão eletrônico'],
    fotos: fotos('imoveis/07-apto-vila-amelia'),
    publicadoEm: '2026-09-26',
  },
  {
    ...base,
    id: 'demo-08',
    slug: 'apartamento-2-quartos-calmon-viana-perto-da-estacao',
    codigo: 'CC-0108',
    destaque: false,
    finalidade: 'venda',
    tipo: 'apartamento',
    titulo: 'Apartamento perto da estação Calmon Viana',
    bairro: bairro('calmon-viana'),
    preco: 295000,
    condominio: 330,
    areaM2: 50,
    quartos: 2,
    banheiros: 1,
    vagas: 1,
    aceitaFinanciamento: true,
    aceitaFgts: true,
    descricao:
      'Apartamento de 50 m² no Calmon Viana, em prédio baixo e arborizado, com dois quartos e uma vaga. A estação Calmon Viana fica a poucos minutos.',
    caracteristicas: ['Perto da estação', 'Prédio baixo', 'Aceita FGTS'],
    fotos: fotos('imoveis/08-apto-calmon-viana'),
    publicadoEm: '2026-09-25',
  },
]

return { bairros: BAIRROS_DEMO, imoveis: IMOVEIS_DEMO }
}
