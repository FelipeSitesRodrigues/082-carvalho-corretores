import Link from '@/components/Link'
import s from './FaixaTopo.module.css'

type Trilha = { rotulo: string; href?: string }

/** Faixa preta das páginas internas: trilha, rótulo, título e texto. */
export function FaixaTopo({
  trilha,
  rotulo,
  titulo,
  texto,
  compacta = false,
}: {
  trilha: Trilha[]
  rotulo?: string
  titulo: React.ReactNode
  texto?: string
  compacta?: boolean
}) {
  return (
    <section className={`escuro ${s.faixa}`} data-compacta={compacta || undefined}>
      <div className="container">
        <nav aria-label="Você está em" className={s.trilha}>
          <ol role="list">
            {trilha.map((t, i) => (
              <li key={t.rotulo}>
                {t.href ? <Link href={t.href}>{t.rotulo}</Link> : <span aria-current="page">{t.rotulo}</span>}
                {i < trilha.length - 1 && <span aria-hidden="true">/</span>}
              </li>
            ))}
          </ol>
        </nav>
        {rotulo && <p className="rotulo">{rotulo}</p>}
        <h1 className={s.titulo}>{titulo}</h1>
        {texto && <p className={s.texto}>{texto}</p>}
      </div>
    </section>
  )
}
