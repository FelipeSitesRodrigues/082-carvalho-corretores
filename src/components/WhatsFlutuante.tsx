'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icone } from './Icone'

/**
 * Botão redondo do WhatsApp. Na home só aparece depois do topo, pra não cobrir
 * os botões do hero; nas outras páginas aparece desde o começo.
 */
export function WhatsFlutuante({ href }: { href: string }) {
  const naHome = usePathname() === '/'
  const [visivel, setVisivel] = useState(!naHome)
  useEffect(() => {
    if (!naHome) {
      setVisivel(true)
      return
    }
    let quadro = 0
    const medir = () => {
      quadro = 0
      setVisivel(window.scrollY > window.innerHeight * 0.75)
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
  }, [naHome])

  return (
    <a
      href={href}
      className="zap-flutuante"
      data-visivel={visivel || undefined}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      tabIndex={visivel ? 0 : -1}
    >
      <Icone nome="whatsapp" />
    </a>
  )
}
