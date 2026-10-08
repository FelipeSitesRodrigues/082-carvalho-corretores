import Link from '@/components/Link'
import type { Bairro } from '@/lib/tipos'
import { Foto } from '../Foto'
import { Icone } from '../Icone'
import s from './Bairros.module.css'

/** Seis bairros com foto, cada um abre a lista de imóveis já filtrada por ele. */
export function Bairros({ bairros }: { bairros: Bairro[] }) {
  return (
    <section id="bairros" style={{ '--cv-d': '353px', '--cv-t': '521px', '--cv-m': '441px' } as React.CSSProperties} className="cv claro secao" aria-labelledby="titulo-bairros">
      <div className="container">
        <div className="cabeca-secao" data-revela>
          <div>
            <p className="rotulo">Bairros</p>
            <h2 id="titulo-bairros" className="titulo-secao">
              Imóveis nos principais
              <br />
              bairros de Poá
            </h2>
          </div>
          <Link href="/imoveis" className={`link-seta ${s.linkTopo}`}>
            Ver todos os bairros
            <Icone nome="seta" />
          </Link>
        </div>

        <ul role="list" className={s.trilho} aria-label="Bairros de Poá">
          {bairros.map((b, i) => (
            <li key={b.slug} data-revela style={{ '--i': i } as React.CSSProperties}>
              <Link href={`/imoveis?bairro=${b.slug}`} className={s.card}>
                <Foto foto={b.foto} sizes="(max-width: 640px) 46vw, (max-width: 1099px) 30vw, 210px" className={s.foto} alt="" adiar />
                <span className={s.nome}>
                  {b.nome}
                  <Icone nome="seta" />
                </span>
                <span className="sr-only">: ver imóveis no bairro</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
