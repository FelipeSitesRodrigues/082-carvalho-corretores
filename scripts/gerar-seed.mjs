/**
 * Escreve supabase/seed.sql a partir da demonstração (src/lib/dados/demo.ts):
 * bairros, config da imobiliária e os imóveis de exemplo com as fotos.
 * Assim, ligando o Supabase, o site continua igual até o Marcos cadastrar os
 * imóveis reais pelo painel.
 *
 * As fotos da demonstração ficam no próprio site (/img/...). O site entende
 * caminho começando com "/" como arquivo local (urlDaFoto em supabase/publico.ts),
 * então elas funcionam sem subir nada pro Storage.
 *
 * Uso: node scripts/gerar-seed.mjs   (Node 24 lê o .ts direto)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { criarDemo } from '../src/lib/dados/demo.ts'
import { CONFIG_PADRAO } from '../src/lib/config.ts'

const fotos = JSON.parse(readFileSync(new URL('../src/lib/dados/fotos.gerado.json', import.meta.url), 'utf8'))
const { bairros, imoveis } = criarDemo(fotos)

const q = (v) => (v == null ? 'null' : `'${String(v).replace(/'/g, "''")}'`)
const centavos = (v) => (v == null ? 'null' : String(Math.round(v * 100)))
const arr = (a) => `array[${a.map(q).join(', ')}]::text[]`

const linhas = [
  '-- Gerado por scripts/gerar-seed.mjs. Não editar à mão: mudar demo.ts e rodar de novo.',
  '-- Rodar DEPOIS da migration, no SQL Editor do Supabase (ou supabase db reset).',
  '',
  'begin;',
  '',
  'insert into public.config (chave, valor, publica) values',
  `  ('imobiliaria', ${q(JSON.stringify(CONFIG_PADRAO))}::jsonb, true)`,
  'on conflict (chave) do update set valor = excluded.valor, publica = excluded.publica;',
  '',
  'insert into public.bairros (slug, nome, foto_path, foto_largura, foto_altura, ordem) values',
  bairros
    .map((b) => `  (${q(b.slug)}, ${q(b.nome)}, ${q(b.foto?.src)}, ${b.foto?.largura ?? 'null'}, ${b.foto?.altura ?? 'null'}, ${b.ordem})`)
    .join(',\n'),
  'on conflict (slug) do update set nome = excluded.nome, foto_path = excluded.foto_path, ordem = excluded.ordem;',
  '',
]

for (const [ordem, i] of imoveis.entries()) {
  const id = randomUUID()
  linhas.push(
    `-- ${i.codigo} · ${i.titulo}`,
    'insert into public.imoveis (id, slug, codigo, status, destaque, ordem, finalidade, tipo, titulo, bairro_slug, cidade, uf,',
    '  preco_centavos, condominio_centavos, iptu_centavos, area_m2, quartos, suites, banheiros, vagas, descricao, caracteristicas,',
    '  aceita_financiamento, aceita_fgts, mobiliado, publicado_em) values (',
    `  ${q(id)}, ${q(i.slug)}, ${q(i.codigo)}, 'publicado', ${i.destaque}, ${ordem}, ${q(i.finalidade)}, ${q(i.tipo)}, ${q(i.titulo)},`,
    `  ${q(i.bairro.slug)}, ${q(i.cidade)}, ${q(i.uf)}, ${centavos(i.preco)}, ${centavos(i.condominio)}, ${centavos(i.iptu)},`,
    `  ${i.areaM2}, ${i.quartos}, ${i.suites}, ${i.banheiros}, ${i.vagas}, ${q(i.descricao)}, ${arr(i.caracteristicas)},`,
    `  ${i.aceitaFinanciamento}, ${i.aceitaFgts}, ${i.mobiliado}, ${q(i.publicadoEm)}`,
    ') on conflict (slug) do nothing;',
  )
  if (i.fotos.length) {
    linhas.push(
      'insert into public.imovel_fotos (imovel_id, path, ordem, largura, altura, alt) values',
      i.fotos.map((f, n) => `  (${q(id)}, ${q(f.src)}, ${n}, ${f.largura}, ${f.altura}, ${q(f.alt)})`).join(',\n') + ';',
    )
  }
  linhas.push('')
}

// o próximo código cadastrado no painel continua a numeração da demonstração
linhas.push(`select setval('public.imovel_codigo_seq', ${100 + imoveis.length});`, '', 'commit;', '')

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), linhas.join('\n'))
console.log(`seed.sql: ${bairros.length} bairros, ${imoveis.length} imóveis, ${imoveis.reduce((t, i) => t + i.fotos.length, 0)} fotos`)
