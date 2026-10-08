import Link from '@/components/Link'
import { preload } from 'react-dom'
import type { ConfigImobiliaria, Foto as TFoto } from '@/lib/tipos'
import { linkWhatsApp, MENSAGEM_GERAL } from '@/lib/formato'
import { Icone, type NomeIcone } from './Icone'
import s from './Hero.module.css'

type Props = { config: ConfigImobiliaria; desktop: TFoto | null; celular: TFoto | null }

/** px: abaixo disso vale a composição do celular */
const LIMITE = 900

/**
 * Topo da home, fiel ao mockup: título em três linhas com "POÁ" em ciano,
 * texto, dois botões e a faixa de quatro informações. No computador a foto
 * ocupa a direita e escurece pra esquerda. No celular segue a regra da casa:
 * título, foto, texto, botões (CLAUDE.md, padrão desde 2026-08-06).
 */
export function Hero({ config, desktop, celular }: Props) {
  // Cada tela baixa só a foto dela, e já no começo do <head>.
  if (desktop?.srcSetAvif)
    preload(desktop.src, {
      as: 'image',
      type: 'image/avif',
      imageSrcSet: desktop.srcSetAvif,
      imageSizes: '72vw',
      media: `(min-width: ${LIMITE}px)`,
      fetchPriority: 'high',
    })
  if (celular?.srcSetAvif)
    preload(celular.src, {
      as: 'image',
      type: 'image/avif',
      imageSrcSet: celular.srcSetAvif,
      imageSizes: '100vw',
      media: `(max-width: ${LIMITE - 1}px)`,
      fetchPriority: 'high',
    })

  const zap = linkWhatsApp(config.whatsapp, MENSAGEM_GERAL)
  const [semana, sabado] = config.horarios
  const infos: { icone: NomeIcone; forte: string; leve: string }[] = [
    { icone: 'pino', forte: `${config.cidade}, ${config.uf}`, leve: `e região do ${config.regiao}` },
    { icone: 'escudo', forte: config.creci, leve: 'Corretor regularizado' },
    { icone: 'relogio', forte: semana?.dias ?? '', leve: semana?.horas ?? '' },
    { icone: 'calendario', forte: sabado?.dias ?? '', leve: sabado?.horas ?? '' },
  ]

  return (
    <section id="inicio" className={`escuro ${s.hero}`} aria-labelledby="titulo-hero">
      <div className={`container ${s.conteudo}`}>
        <h1 id="titulo-hero" className={s.titulo}>
          <span className={s.linha} style={{ '--i': 0 } as React.CSSProperties}>
            O seu
          </span>{' '}
          <span className={s.linha} style={{ '--i': 1 } as React.CSSProperties}>
            próximo imóvel
          </span>{' '}
          <span className={s.linha} style={{ '--i': 2 } as React.CSSProperties}>
            em <span className="destaque">{config.cidade}</span>
          </span>
        </h1>

        <div className={s.foto}>
          {desktop && celular && (
            <picture>
              <source media={`(min-width: ${LIMITE}px)`} type="image/avif" srcSet={desktop.srcSetAvif} sizes="72vw" />
              <source media={`(min-width: ${LIMITE}px)`} type="image/webp" srcSet={desktop.srcSetWebp} sizes="72vw" />
              <source type="image/avif" srcSet={celular.srcSetAvif} sizes="100vw" />
              <source type="image/webp" srcSet={celular.srcSetWebp} sizes="100vw" />
              <img
                src={celular.src}
                width={celular.largura}
                height={celular.altura}
                alt={desktop.alt}
                fetchPriority="high"
                loading="eager"
                decoding="async"
              />
            </picture>
          )}
        </div>

        <p className={s.texto}>
          Apartamentos e casas para comprar ou alugar, com corretor acompanhando da primeira visita até a entrega da chave.
        </p>

        <div className={s.botoes}>
          <Link href="/imoveis" className="botao botao-ciano">
            Ver imóveis disponíveis
            <Icone nome="seta" className="seta" />
          </Link>
          <a href={zap} className="botao botao-contorno" target="_blank" rel="noopener noreferrer">
            <Icone nome="whatsapp" />
            Falar no WhatsApp
          </a>
        </div>

        <ul role="list" className={s.infos}>
          {infos.map((info) => (
            <li key={info.icone}>
              <Icone nome={info.icone} className={s.infoIcone} />
              <span>
                <strong>{info.forte}</strong>
                {info.leve}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
