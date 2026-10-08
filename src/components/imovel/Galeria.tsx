'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Foto as TFoto } from '@/lib/tipos'
import { Foto } from '../Foto'
import { Icone } from '../Icone'
import s from './Galeria.module.css'

/**
 * Uma lista de fotos só, que o CSS mostra como mosaico no computador (grande +
 * duas menores) e como carrossel de deslize no celular. Assim a primeira foto
 * é a mesma nas duas telas e baixa uma vez só (é o LCP da página).
 * A tela cheia é um <dialog> nativo: foco preso, Esc fecha, foco volta.
 */
export function Galeria({ fotos, titulo }: { fotos: TFoto[]; titulo: string }) {
  const dialogo = useRef<HTMLDialogElement>(null)
  const trilhoTela = useRef<HTMLDivElement>(null)
  const [atual, setAtual] = useState(0)
  const [atualCel, setAtualCel] = useState(0)
  const [aberta, setAberta] = useState(false)

  const irPara = useCallback(
    (i: number, comportamento: ScrollBehavior = 'smooth') => {
      const t = trilhoTela.current
      if (!t) return
      const alvo = Math.max(0, Math.min(fotos.length - 1, i))
      t.scrollTo({ left: alvo * t.clientWidth, behavior: comportamento })
    },
    [fotos.length],
  )

  function abrir(i: number) {
    setAtual(i)
    setAberta(true)
    dialogo.current?.showModal()
    requestAnimationFrame(() => irPara(i, 'instant'))
  }

  useEffect(() => {
    const d = dialogo.current
    if (!d) return
    const fechou = () => setAberta(false)
    d.addEventListener('close', fechou)
    return () => d.removeEventListener('close', fechou)
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = aberta ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [aberta])

  const indice = (el: HTMLDivElement) => Math.round(el.scrollLeft / Math.max(1, el.clientWidth))

  if (!fotos.length) return null
  const extras = fotos.length - 3

  return (
    <div className={s.galeria}>
      <div className={s.fotos} data-quantas={Math.min(fotos.length, 3)} onScroll={(e) => setAtualCel(indice(e.currentTarget))}>
        {fotos.map((f, i) => (
          <button key={f.src} type="button" className={s.peca} onClick={() => abrir(i)} aria-label={`Ampliar foto ${i + 1} de ${fotos.length}`}>
            <Foto
              foto={f}
              sizes={i === 0 ? '(max-width: 767px) 100vw, (max-width: 1279px) 62vw, 800px' : '(max-width: 767px) 100vw, 400px'}
              prioridade={i === 0}
            />
            {i === 2 && extras > 0 && (
              <span className={s.mais}>
                <Icone nome="area" />+{extras} {extras === 1 ? 'foto' : 'fotos'}
              </span>
            )}
          </button>
        ))}
      </div>
      <span className={s.contador} aria-hidden="true">
        {atualCel + 1} / {fotos.length}
      </span>

      <dialog
        ref={dialogo}
        className={s.tela}
        aria-label={`Fotos de ${titulo}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') irPara(atual + 1)
          if (e.key === 'ArrowLeft') irPara(atual - 1)
        }}
      >
        <div className={s.topo}>
          <span aria-live="polite">
            {atual + 1} / {fotos.length}
          </span>
          <button type="button" className={s.fechar} onClick={() => dialogo.current?.close()} aria-label="Fechar fotos">
            <Icone nome="fechar" />
          </button>
        </div>
        <div ref={trilhoTela} className={s.trilhoTela} onScroll={(e) => setAtual(indice(e.currentTarget))}>
          {fotos.map((f) => (
            <figure key={f.src} className={s.slideTela}>
              {aberta && <Foto foto={f} sizes="100vw" />}
            </figure>
          ))}
        </div>
        <button type="button" className={`${s.seta} ${s.anterior}`} onClick={() => irPara(atual - 1)} disabled={atual === 0} aria-label="Foto anterior">
          <Icone nome="esquerda" />
        </button>
        <button
          type="button"
          className={`${s.seta} ${s.proxima}`}
          onClick={() => irPara(atual + 1)}
          disabled={atual === fotos.length - 1}
          aria-label="Próxima foto"
        >
          <Icone nome="direita" />
        </button>
      </dialog>
    </div>
  )
}
