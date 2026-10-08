import type { Metadata, Viewport } from 'next'
import { Sora } from 'next/font/google'
import { Header } from '@/components/Header'
import { Rodape } from '@/components/Rodape'
import { Revelar } from '@/components/Revelar'
import { WhatsFlutuante } from '@/components/WhatsFlutuante'
import { buscarConfig, listarBairros } from '@/lib/dados'
import { INDEXAR, SITE_URL } from '@/lib/config'
import { linkWhatsApp, MENSAGEM_GERAL } from '@/lib/formato'
import './globals.css'

const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap', weight: ['600', '700', '800'] })

const TITULO = 'Carvalho Corretores | Imobiliária em Poá, SP: apartamentos e casas'
const DESCRICAO =
  'Imobiliária em Poá, SP. Apartamentos e casas para comprar ou alugar no Centro, Calmon Viana, Vila Perracini e região do Alto Tietê, com corretor da primeira visita até a entrega da chave.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITULO, template: '%s | Carvalho Corretores' },
  description: DESCRICAO,
  applicationName: 'Carvalho Corretores',
  alternates: { canonical: '/' },
  robots: INDEXAR ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Carvalho Corretores',
    title: TITULO,
    description: DESCRICAO,
    url: '/',
    images: [{ url: '/img/og.jpg', width: 1200, height: 630, alt: 'Carvalho Corretores, imobiliária em Poá, SP' }],
  },
  twitter: { card: 'summary_large_image', title: TITULO, description: DESCRICAO, images: ['/img/og.jpg'] },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#0b0d0e',
  width: 'device-width',
  initialScale: 1,
}

/**
 * Marca <html class="js"> antes da primeira pintura (a revelação no scroll só
 * esconde com JS). Se o Revelar não montar em 2,5 s, devolve tudo visível.
 * Também marca cv-pronto em clique de âncora (ver .cv no globals.css).
 */
const SCRIPT_JS =
  "var h=document.documentElement;h.classList.add('js');" +
  "if(location.hash)h.classList.add('cv-pronto');" +
  "document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href*=\"#\"]');if(a)h.classList.add('cv-pronto')},true);" +
  "setTimeout(function(){if(!h.classList.contains('revela-pronto'))h.classList.remove('js')},2500)"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [config, bairros] = await Promise.all([buscarConfig(), listarBairros()])
  const zap = linkWhatsApp(config.whatsapp, MENSAGEM_GERAL)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: config.nomeCompleto,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-sobre-claro.svg`,
    image: `${SITE_URL}/img/og.jpg`,
    description: DESCRICAO,
    address: { '@type': 'PostalAddress', addressLocality: config.cidade, addressRegion: config.uf, addressCountry: 'BR' },
    areaServed: [config.cidade, `${config.regiao}, ${config.uf}`].map((nome) => ({ '@type': 'City', name: nome })),
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Saturday', opens: '09:00', closes: '13:00' },
    ],
    // telefone só entra quando deixar de ser o de exemplo do mockup
    ...(config.dadosDeExemplo ? {} : { telephone: `+${config.whatsapp}` }),
  }

  return (
    <html lang="pt-BR" className={sora.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_JS }} />
      </head>
      <body>
        <a href="#conteudo" className="pular">
          Pular para o conteúdo
        </a>
        <Header whatsappLink={zap} whatsappExibicao={config.whatsappExibicao} />
        <main id="conteudo">{children}</main>
        <Rodape config={config} bairros={bairros} />
        <WhatsFlutuante href={zap} />
        <Revelar />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      </body>
    </html>
  )
}
