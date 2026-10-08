import type { Foto as TFoto } from '@/lib/tipos'

type Props = {
  foto: TFoto | null | undefined
  sizes: string
  className?: string
  /** true só na imagem do LCP */
  prioridade?: boolean
  /**
   * true pra foto que não é do topo: o endereço só entra depois do "load" da
   * página (Revelar.tsx). O lazy do Chrome antecipa foto até ~1.250 px abaixo
   * da tela, e no celular as fotos dos cards começavam junto com a do hero e
   * entravam na conta do LCP simulado (memória lcp-janela-pessimista).
   */
  adiar?: boolean
  alt?: string
}

/**
 * <picture> com AVIF e WebP em várias larguras (do processar-imagens.mjs).
 * Foto do Supabase vem sem srcset e cai no <img> simples, com width/height pra
 * reservar o espaço.
 */
export function Foto({ foto, sizes, className, prioridade = false, adiar = false, alt }: Props) {
  if (!foto) return <span className={className} data-sem-foto aria-hidden="true" />
  const fonte = (srcSet: string | undefined) => (adiar ? { 'data-srcset': srcSet } : { srcSet })
  return (
    <picture className={className}>
      {foto.srcSetAvif && <source type="image/avif" sizes={sizes} {...fonte(foto.srcSetAvif)} />}
      {foto.srcSetWebp && <source type="image/webp" sizes={sizes} {...fonte(foto.srcSetWebp)} />}
      <img
        {...(adiar ? { 'data-src': foto.src, 'data-adiar': '' } : { src: foto.src })}
        width={foto.largura}
        height={foto.altura}
        alt={alt ?? foto.alt}
        loading={prioridade ? 'eager' : 'lazy'}
        fetchPriority={prioridade ? 'high' : 'auto'}
        decoding="async"
      />
    </picture>
  )
}
