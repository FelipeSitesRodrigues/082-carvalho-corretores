'use client'

import Link from '@/components/Link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Icone } from './Icone'
import { Logo } from './Logo'
import { MENU, type ItemMenu } from '@/lib/menu'
import s from './Header.module.css'


type Props = { whatsappLink: string; whatsappExibicao: string }

/**
 * Cabeçalho fixo. Na home nasce transparente sobre a foto do topo e ganha
 * fundo depois de 24 px de rolagem. Nas outras páginas já nasce com fundo.
 * Na home, o item do menu acompanha a seção que está na tela.
 */
export function Header({ whatsappLink, whatsappExibicao }: Props) {
  const caminho = usePathname()
  const naHome = caminho === '/'
  const [rolou, setRolou] = useState(false)
  const [aberto, setAberto] = useState(false)
  const [secao, setSecao] = useState('inicio')
  const [busca, setBusca] = useState('')
  const botaoMenu = useRef<HTMLButtonElement>(null)
  const painel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setBusca(window.location.search)
  }, [caminho])

  useEffect(() => {
    let quadro = 0
    const medir = () => {
      quadro = 0
      setRolou(window.scrollY > 24)
    }
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir)
    }
    quadro = requestAnimationFrame(medir)
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => {
      window.removeEventListener('scroll', aoRolar)
      cancelAnimationFrame(quadro)
    }
  }, [])

  // Item ativo segue a seção na tela (só na home).
  useEffect(() => {
    if (!naHome) return
    const ids = ['inicio', 'imoveis', 'sobre', 'simulador', 'bairros', 'como-funciona', 'contato']
    const elementos = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const mapa: Record<string, string> = { imoveis: 'inicio', simulador: 'sobre', 'como-funciona': 'bairros' }
    const io = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visivel) setSecao(mapa[visivel.target.id] ?? visivel.target.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    )
    elementos.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [naHome])

  // Menu do celular: trava a rolagem, fecha no Esc e devolve o foco ao botão.
  useEffect(() => {
    if (!aberto) return
    const raiz = document.documentElement
    raiz.style.overflow = 'hidden'
    painel.current?.querySelector<HTMLElement>('a')?.focus({ preventScroll: true })
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberto(false)
    }
    window.addEventListener('keydown', tecla)
    return () => {
      raiz.style.overflow = ''
      window.removeEventListener('keydown', tecla)
      botaoMenu.current?.focus({ preventScroll: true })
    }
  }, [aberto])

  useEffect(() => setAberto(false), [caminho])

  const ativo = (item: ItemMenu) => {
    if (naHome) return item.secao === secao
    if (caminho.startsWith('/imoveis')) {
      if (item.rotulo === 'Comprar') return busca.includes('finalidade=venda')
      if (item.rotulo === 'Alugar') return busca.includes('finalidade=aluguel')
    }
    return false
  }

  const solido = !naHome || rolou || aberto

  return (
    <header className={s.cabecalho} data-solido={solido || undefined} data-aberto={aberto || undefined}>
      <div className={`container ${s.barra}`}>
        <Link href="/" className={s.marca} aria-label="Carvalho Corretores, página inicial">
          <Logo altura={46} className={s.logo} />
        </Link>

        <nav className={s.nav} aria-label="Principal">
          <ul role="list">
            {MENU.map((item) => (
              <li key={item.rotulo}>
                <Link href={item.href} className={s.link} aria-current={ativo(item) ? 'page' : undefined}>
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <a href={whatsappLink} className={`botao botao-verde ${s.zap}`} target="_blank" rel="noopener noreferrer">
          <Icone nome="whatsapp" />
          <span>{whatsappExibicao}</span>
        </a>

        <div className={s.acoesCelular}>
          <a href={whatsappLink} className={s.zapIcone} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp">
            <Icone nome="whatsapp" />
          </a>
          <button
            ref={botaoMenu}
            type="button"
            className={s.botaoMenu}
            aria-expanded={aberto}
            aria-controls="menu-celular"
            aria-label={aberto ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setAberto((v) => !v)}
          >
            <span className={s.hamburguer} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div id="menu-celular" ref={painel} className={s.painel} inert={!aberto} data-aberto={aberto || undefined}>
        <nav aria-label="Menu do celular" className="container">
          <ul role="list" className={s.listaCelular}>
            {MENU.map((item, i) => (
              <li key={item.rotulo} style={{ '--i': i } as React.CSSProperties}>
                <Link href={item.href} className={s.linkCelular} onClick={() => setAberto(false)} aria-current={ativo(item) ? 'page' : undefined}>
                  {item.rotulo}
                  <Icone nome="seta" />
                </Link>
              </li>
            ))}
          </ul>
          <a href={whatsappLink} className={`botao botao-verde ${s.zapCelular}`} target="_blank" rel="noopener noreferrer">
            <Icone nome="whatsapp" />
            Falar no WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}
