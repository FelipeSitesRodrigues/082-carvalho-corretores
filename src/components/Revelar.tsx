'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Marca .visivel nos [data-revela] quando entram na tela. Um observador só pra
 * página inteira. O <html class="js"> vem de um script inline no <head>, com
 * prazo: se este componente não montar em 2,5 s, o script tira a classe e
 * tudo aparece sem animação (nunca fica conteúdo escondido por JS quebrado).
 */
export function Revelar() {
  const caminho = usePathname()
  // Fotos adiadas (Foto com adiar): o endereço entra depois do load da página.
  useEffect(() => {
    const soltar = () => {
      document.querySelectorAll<HTMLImageElement>('img[data-adiar]').forEach((img) => {
        img.parentElement?.querySelectorAll<HTMLSourceElement>('source[data-srcset]').forEach((s) => {
          s.srcset = s.dataset.srcset ?? ''
          s.removeAttribute('data-srcset')
        })
        const pronta = () => img.classList.add('carregou')
        img.addEventListener('load', pronta, { once: true })
        if (img.dataset.src) img.src = img.dataset.src
        img.removeAttribute('data-src')
        if (img.complete && img.naturalWidth) pronta()
      })
    }
    if (document.readyState === 'complete') {
      soltar()
      return
    }
    const aoCarregar = () => setTimeout(soltar, 0)
    window.addEventListener('load', aoCarregar, { once: true })
    return () => window.removeEventListener('load', aoCarregar)
  }, [caminho])

  useEffect(() => {
    const raiz = document.documentElement
    raiz.classList.add('revela-pronto')
    const alvos = Array.from(document.querySelectorAll<HTMLElement>('[data-revela]:not(.visivel)'))
    if (!('IntersectionObserver' in window)) {
      alvos.forEach((a) => a.classList.add('visivel'))
      return
    }
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add('visivel')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    alvos.forEach((a) => io.observe(a))
    return () => io.disconnect()
  }, [caminho])
  return null
}
