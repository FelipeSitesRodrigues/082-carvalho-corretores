/**
 * Prepara as imagens do site: recorta, reduz e grava AVIF + WebP em várias
 * larguras em public/img/, e escreve src/lib/dados/fotos.gerado.json, que é o
 * que os componentes leem (src, largura, altura, srcset e alt).
 *
 * Origem: a pasta de documentação do cliente, "sites/082 - Carvalho Corretores/
 * Recursos Site/" (heros do mockup e FOTOS DEMO, baixadas do Unsplash com
 * créditos em FOTOS DEMO/creditos.json).
 *
 * Uso: node scripts/processar-imagens.mjs
 * Arquivo que não existe é pulado com aviso: o site trata foto ausente.
 */
import sharp from 'sharp'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const RECURSOS = join(RAIZ, '..', '082 - Carvalho Corretores', 'Recursos Site')
const DEMO = join(RECURSOS, 'FOTOS DEMO')
const SAIDA = join(RAIZ, 'public', 'img')
const MANIFESTO = join(RAIZ, 'src', 'lib', 'dados', 'fotos.gerado.json')

const creditos = existsSync(join(DEMO, 'creditos.json'))
  ? Object.fromEntries(JSON.parse(readFileSync(join(DEMO, 'creditos.json'), 'utf8')).map((c) => [c.arquivo, c]))
  : {}

const manifesto = {}
let total = 0

/**
 * @param chave     chave no manifesto, ex.: "imoveis/01-apto-centro"
 * @param origem    caminho do arquivo original
 * @param nome      nome base de saída, ex.: "imoveis/01-apto-centro-1"
 * @param larguras  larguras geradas (a maior vira o src)
 * @param proporcao largura/altura do recorte, ou null pra manter
 * @param alt       texto alternativo
 * @param opcoes    { qAvif, qWebp, posicao, recorte: {left,top,width,height} }
 */
async function gerar(chave, origem, nome, larguras, proporcao, alt, opcoes = {}) {
  if (!existsSync(origem)) {
    console.warn('  falta', origem.replace(RAIZ, ''))
    return
  }
  const { qAvif = 52, qWebp = 74, posicao = 'centre', recorte } = opcoes
  let img = sharp(origem).rotate()
  if (recorte) img = img.extract(recorte)
  const buf = await img.toBuffer()
  const meta = await sharp(buf).metadata()
  let w = meta.width
  let h = meta.height
  let base = sharp(buf)
  if (proporcao) {
    if (w / h > proporcao) w = Math.round(h * proporcao)
    else h = Math.round(w / proporcao)
    base = base.resize(w, h, { fit: 'cover', position: posicao })
  }
  const pronta = await base.toBuffer()
  const usadas = larguras.filter((l) => l <= w)
  if (!usadas.length || usadas.at(-1) < w * 0.92) usadas.push(Math.min(w, Math.max(...larguras)))
  const lista = [...new Set(usadas)].sort((a, b) => a - b)

  mkdirSync(join(SAIDA, nome.split('/').slice(0, -1).join('/')), { recursive: true })
  const avif = []
  const webp = []
  for (const l of lista) {
    const alt_ = Math.round((l * h) / w)
    const r = sharp(pronta).resize(l, alt_)
    await r.clone().avif({ quality: qAvif, effort: 5 }).toFile(join(SAIDA, `${nome}-${l}.avif`))
    await r.clone().webp({ quality: qWebp, effort: 5 }).toFile(join(SAIDA, `${nome}-${l}.webp`))
    avif.push(`/img/${nome}-${l}.avif ${l}w`)
    webp.push(`/img/${nome}-${l}.webp ${l}w`)
    total += 2
  }
  const maior = lista.at(-1)
  ;(manifesto[chave] ??= []).push({
    src: `/img/${nome}-${maior}.webp`,
    largura: maior,
    altura: Math.round((maior * h) / w),
    alt,
    srcSetWebp: webp.join(', '),
    srcSetAvif: avif.join(', '),
  })
}

const altDe = (arquivo, padrao) => creditos[arquivo]?.descricao || padrao

console.log('hero')
await gerar(
  'hero/desktop',
  join(RECURSOS, 'IMAGEM HERO DESTKOP.png'),
  'hero/desktop',
  [960, 1280, 1672],
  null,
  'Sala de estar de apartamento no fim da tarde, com varanda envidraçada e vista para a cidade',
  { qAvif: 60, qWebp: 80 },
)
// Celular: recorte 4:5 do retrato, da janela com a cidade até a mesa de centro.
await gerar(
  'hero/mobile',
  join(RECURSOS, 'IMAGEM HERO MOBILE.png'),
  'hero/mobile',
  [480, 800, 941],
  4 / 5,
  'Sala de estar de apartamento no fim da tarde, com varanda envidraçada e vista para a cidade',
  { qAvif: 50, qWebp: 74, recorte: { left: 0, top: 300, width: 941, height: 1176 } },
)

if (existsSync(join(DEMO, 'imoveis'))) {
  console.log('imoveis')
  for (const id of readdirSync(join(DEMO, 'imoveis')).sort()) {
    const pasta = join(DEMO, 'imoveis', id)
    const arquivos = readdirSync(pasta).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()
    for (const [n, arq] of arquivos.entries()) {
      await gerar(`imoveis/${id}`, join(pasta, arq), `imoveis/${id}-${n + 1}`, [480, 800, 1200, 1600], 3 / 2, altDe(`imoveis/${id}/${arq}`, 'Foto do imóvel'))
    }
  }
}

if (existsSync(join(DEMO, 'bairros'))) {
  console.log('bairros')
  for (const arq of readdirSync(join(DEMO, 'bairros')).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()) {
    const id = arq.replace(/\.\w+$/, '')
    await gerar(`bairros/${id}`, join(DEMO, 'bairros', arq), `bairros/${id}`, [400, 640], 6 / 5, altDe(`bairros/${arq}`, 'Rua de Poá'))
  }
}

console.log('extras')
await gerar('extras/contato', join(DEMO, 'extras', 'contato.jpg'), 'extras/contato', [640, 960, 1280], 4 / 3, altDe('extras/contato.jpg', 'Sala de jantar de apartamento com vista para a cidade'))
await gerar('extras/por-que-fundo', join(DEMO, 'extras', 'por-que-fundo.jpg'), 'extras/por-que-fundo', [960, 1600], null, '', { qAvif: 40, qWebp: 62 })

writeFileSync(MANIFESTO, JSON.stringify(manifesto, null, 2) + '\n')
console.log(`ok: ${total} arquivos, ${Object.keys(manifesto).length} chaves no manifesto`)
