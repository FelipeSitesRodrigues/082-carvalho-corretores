import type { Metadata } from 'next'
import Link from '@/components/Link'
import { notFound } from 'next/navigation'
import { FaixaTopo } from '@/components/FaixaTopo'
import { Galeria } from '@/components/imovel/Galeria'
import { CardImovel } from '@/components/CardImovel'
import { Icone, type NomeIcone } from '@/components/Icone'
import { buscarConfig, buscarImovel, imoveisParecidos, listarImoveis } from '@/lib/dados'
import { SITE_URL } from '@/lib/config'
import { linkWhatsApp, mensagemImovel, mensagemVisita, moeda, numero, plural, precoImovel, rotuloTipo } from '@/lib/formato'
import s from './imovel.module.css'

export const revalidate = 300
// imóvel novo cadastrado no painel ganha página sem precisar de novo deploy
export const dynamicParams = true

export async function generateStaticParams() {
  return (await listarImoveis()).map((i) => ({ slug: i.slug }))
}

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const imovel = await buscarImovel((await params).slug)
  if (!imovel) return { title: 'Imóvel não encontrado' }
  const acao = imovel.finalidade === 'venda' ? 'à venda' : 'para alugar'
  const preco = precoImovel(imovel)
  const descricao = `${rotuloTipo[imovel.tipo]} ${acao} no bairro ${imovel.bairro.nome}, ${imovel.cidade} - ${imovel.uf}: ${numero(imovel.areaM2)} m², ${plural(imovel.quartos, 'quarto', 'quartos')} e ${plural(imovel.vagas, 'vaga', 'vagas')}. ${preco.valor}${preco.sufixo ? ` ${preco.sufixo}` : ''}.`
  const foto = imovel.fotos[0]
  return {
    title: `${imovel.titulo} ${acao} em ${imovel.cidade}`,
    description: descricao,
    alternates: { canonical: `/imoveis/${imovel.slug}` },
    openGraph: {
      title: `${imovel.titulo} ${acao} em ${imovel.cidade}`,
      description: descricao,
      url: `/imoveis/${imovel.slug}`,
      images: foto ? [{ url: foto.src, width: foto.largura, height: foto.altura, alt: foto.alt }] : undefined,
    },
  }
}

export default async function PaginaImovel({ params }: Params) {
  const { slug } = await params
  const [imovel, config] = await Promise.all([buscarImovel(slug), buscarConfig()])
  if (!imovel) notFound()
  const parecidos = await imoveisParecidos(imovel, 4)
  const preco = precoImovel(imovel)
  const venda = imovel.finalidade === 'venda'

  const ficha: { icone: NomeIcone; valor: string; rotulo: string }[] = [
    { icone: 'area', valor: `${numero(imovel.areaM2)} m²`, rotulo: 'Área' },
    { icone: 'cama', valor: String(imovel.quartos), rotulo: imovel.quartos === 1 ? 'Quarto' : 'Quartos' },
    ...(imovel.suites ? [{ icone: 'cama' as NomeIcone, valor: String(imovel.suites), rotulo: imovel.suites === 1 ? 'Suíte' : 'Suítes' }] : []),
    { icone: 'banheira', valor: String(imovel.banheiros), rotulo: imovel.banheiros === 1 ? 'Banheiro' : 'Banheiros' },
    { icone: 'carro', valor: String(imovel.vagas), rotulo: imovel.vagas === 1 ? 'Vaga' : 'Vagas' },
  ]
  const extras = [
    ...imovel.caracteristicas,
    ...(imovel.aceitaFinanciamento ? ['Aceita financiamento'] : []),
    ...(imovel.aceitaFgts ? ['Aceita FGTS'] : []),
    ...(imovel.mobiliado ? ['Mobiliado'] : []),
  ]
  const custos = [
    imovel.condominio != null && { rotulo: 'Condomínio', valor: imovel.condominio },
    imovel.iptu != null && { rotulo: 'IPTU', valor: imovel.iptu },
  ].filter(Boolean) as { rotulo: string; valor: number }[]
  const totalAluguel = !venda && custos.length ? imovel.preco + custos.reduce((t, c) => t + c.valor, 0) : null

  const trilha = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Imóveis', item: `${SITE_URL}/imoveis` },
      { '@type': 'ListItem', position: 3, name: imovel.titulo, item: `${SITE_URL}/imoveis/${imovel.slug}` },
    ],
  }

  return (
    <>
      <FaixaTopo
        compacta
        trilha={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Imóveis', href: '/imoveis' }, { rotulo: imovel.titulo }]}
        rotulo={`${venda ? 'Venda' : 'Aluguel'} · Cód. ${imovel.codigo}`}
        titulo={imovel.titulo}
        texto={`${imovel.bairro.nome}, ${imovel.cidade} - ${imovel.uf}`}
      />

      <div className={`claro ${s.pagina}`}>
        <div className="container">
          <Galeria fotos={imovel.fotos} titulo={imovel.titulo} />

          <div className={s.grade}>
            <div className={s.principal}>
              <ul role="list" className={s.ficha} aria-label="Ficha do imóvel">
                {ficha.map((f) => (
                  <li key={f.rotulo}>
                    <Icone nome={f.icone} />
                    <strong>{f.valor}</strong>
                    <span>{f.rotulo}</span>
                  </li>
                ))}
              </ul>

              <section className={s.bloco} aria-labelledby="sobre-imovel">
                <h2 id="sobre-imovel">Sobre o imóvel</h2>
                <p>{imovel.descricao}</p>
              </section>

              {extras.length > 0 && (
                <section className={s.bloco} aria-labelledby="caracteristicas">
                  <h2 id="caracteristicas">Características</h2>
                  <ul role="list" className={s.lista}>
                    {extras.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className={s.bloco} aria-labelledby="localizacao">
                <h2 id="localizacao">Localização</h2>
                <p>
                  Bairro {imovel.bairro.nome}, {imovel.cidade} - {imovel.uf}. O endereço completo é passado pelo corretor na hora de agendar a
                  visita.
                </p>
                <Link href={`/imoveis?bairro=${imovel.bairro.slug}`} className="link-seta">
                  Mais imóveis no {imovel.bairro.nome}
                  <Icone nome="seta" />
                </Link>
              </section>
            </div>

            <aside className={s.lateral} aria-label="Valor e contato">
              <div className={s.cartao}>
                <p className={s.finalidade}>{venda ? 'Valor de venda' : 'Aluguel mensal'}</p>
                <p className={s.preco}>
                  {preco.valor}
                  {preco.sufixo && <span> {preco.sufixo}</span>}
                </p>
                {custos.length > 0 && (
                  <dl className={s.custos}>
                    {custos.map((c) => (
                      <div key={c.rotulo}>
                        <dt>{c.rotulo}</dt>
                        <dd>{moeda(c.valor)}</dd>
                      </div>
                    ))}
                    {totalAluguel && (
                      <div className={s.total}>
                        <dt>Total por mês</dt>
                        <dd>{moeda(totalAluguel)}</dd>
                      </div>
                    )}
                  </dl>
                )}
                <div className={s.acoes}>
                  <a href={linkWhatsApp(config.whatsapp, mensagemImovel(imovel))} className="botao botao-verde" target="_blank" rel="noopener noreferrer">
                    <Icone nome="whatsapp" />
                    Tenho interesse
                  </a>
                  <a href={linkWhatsApp(config.whatsapp, mensagemVisita(imovel))} className={`botao ${s.visita}`} target="_blank" rel="noopener noreferrer">
                    <Icone nome="calendario" />
                    Agendar visita
                  </a>
                  {venda && imovel.aceitaFinanciamento && (
                    <Link href={`/?valor=${imovel.preco}#simulador`} className={s.simular}>
                      <Icone nome="calculadora" />
                      Simular financiamento deste imóvel
                    </Link>
                  )}
                </div>
                <p className={s.codigo}>
                  Código do imóvel: <strong>{imovel.codigo}</strong>
                </p>
              </div>
            </aside>
          </div>
        </div>

        {parecidos.length > 0 && (
          <section className={s.parecidos} aria-labelledby="parecidos">
            <div className="container">
              <div className="cabeca-secao">
                <div>
                  <p className="rotulo">Veja também</p>
                  <h2 id="parecidos" className="titulo-secao">
                    Outros imóveis
                  </h2>
                </div>
                <Link href="/imoveis" className="link-seta">
                  Ver todos os imóveis
                  <Icone nome="seta" />
                </Link>
              </div>
              <ul role="list" className={s.gradeParecidos}>
                {parecidos.map((p) => (
                  <li key={p.id}>
                    <CardImovel imovel={p} whatsapp={config.whatsapp} adiar />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(trilha).replace(/</g, '\\u003c') }} />
    </>
  )
}
