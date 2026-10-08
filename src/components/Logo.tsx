/** Lockup Casa-C (logo A, escolhido em 2026-10-07). Proporção 754,8 x 142,5. */
export function Logo({ sobre = 'escuro', altura = 46, className }: { sobre?: 'escuro' | 'claro'; altura?: number; className?: string }) {
  const largura = Math.round((altura * 754.8) / 142.54)
  return (
    <img
      src={sobre === 'escuro' ? '/logo-sobre-escuro.svg' : '/logo-sobre-claro.svg'}
      width={largura}
      height={altura}
      alt="Carvalho Corretores de Imóveis"
      className={className}
      decoding="async"
    />
  )
}
