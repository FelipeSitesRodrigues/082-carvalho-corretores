import type { Metadata } from 'next'
import { FaixaTopo } from '@/components/FaixaTopo'
import { buscarConfig } from '@/lib/dados'
import { CREDITOS_CC } from '@/lib/creditos'
import s from './politica.module.css'

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description: 'Como a Carvalho Corretores usa os dados que você envia pelo site.',
  alternates: { canonical: '/politica-de-privacidade' },
}

export default async function Politica() {
  const config = await buscarConfig()
  return (
    <>
      <FaixaTopo compacta trilha={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Política de privacidade' }]} titulo="Política de privacidade" />
      <div className="claro">
        <article className={`container ${s.texto}`}>
          <p>
            Esta página explica como a {config.nomeCompleto} ({config.creci}), de {config.cidade}, {config.uf}, trata os dados pessoais
            enviados por este site, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>

          <h2>Quais dados coletamos</h2>
          <p>
            Só o que você escreve no formulário de contato: nome, telefone (WhatsApp) e o que você procura. O site não pede CPF, endereço
            nem documento.
          </p>

          <h2>Para que usamos</h2>
          <p>
            Para responder o seu contato pelo WhatsApp ou por telefone e indicar imóveis que combinem com o que você procura. Não vendemos
            nem repassamos seus dados a terceiros.
          </p>

          <h2>Quanto tempo guardamos</h2>
          <p>
            Enquanto o atendimento estiver em andamento e, depois disso, pelo tempo necessário para cumprir obrigações legais. Você pode
            pedir a exclusão a qualquer momento.
          </p>

          <h2>Simulador de financiamento</h2>
          <p>
            Os valores que você digita no simulador são calculados no seu próprio navegador e não são enviados para nós, a não ser que você
            clique para falar com um corretor.
          </p>

          <h2>Cookies</h2>
          <p>Este site não usa cookies de publicidade nem de rastreamento.</p>

          <h2>Seus direitos</h2>
          <p>
            Você pode pedir para ver, corrigir ou apagar seus dados pelo WhatsApp {config.whatsappExibicao}. A resposta sai em até 15 dias.
          </p>

          <h2>Fotos de demonstração</h2>
          <p>
            Parte das fotos de imóveis e bairros deste site é ilustrativa, de banco de imagens (Unsplash, licença de uso livre), e será
            substituída pelas fotos reais dos imóveis.
          </p>
          <ul className={s.creditos}>
            {CREDITOS_CC.map((c) => (
              <li key={c.url}>
                {c.foto}. Foto de {c.autor},{' '}
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  Wikimedia Commons
                </a>
                , licença{' '}
                <a href="https://creativecommons.org/licenses/by/3.0/deed.pt-br" target="_blank" rel="noopener noreferrer">
                  {c.licenca}
                </a>
                .
              </li>
            ))}
          </ul>

          <p className={s.data}>Atualizada em 7 de outubro de 2026.</p>
        </article>
      </div>
    </>
  )
}
