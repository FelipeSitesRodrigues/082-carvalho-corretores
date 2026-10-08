import Link from '@/components/Link'
import type { Imovel } from '@/lib/tipos'
import { CardImovel } from '../CardImovel'
import { Icone } from '../Icone'
import s from './Vitrine.module.css'

/** Imóveis em destaque: 4 cards em linha no computador, carrossel de deslize no celular. */
export function Vitrine({ imoveis, whatsapp }: { imoveis: Imovel[]; whatsapp: string }) {
  return (
    <section id="imoveis" className="claro secao" aria-labelledby="titulo-imoveis">
      <div className="container">
        <div className="cabeca-secao" data-revela>
          <div>
            <p className="rotulo">Imóveis em destaque</p>
            <h2 id="titulo-imoveis" className="titulo-secao">
              Encontre o imóvel ideal
            </h2>
            <p>Casas e apartamentos à venda e para alugar em Poá e região.</p>
          </div>
          <Link href="/imoveis" className={`link-seta ${s.linkTopo}`}>
            Ver todos os imóveis
            <Icone nome="seta" />
          </Link>
        </div>

        <ul role="list" className={s.trilho} aria-label="Imóveis em destaque">
          {imoveis.map((imovel, i) => (
            <li key={imovel.id} data-revela style={{ '--i': i } as React.CSSProperties}>
              <CardImovel imovel={imovel} whatsapp={whatsapp} adiar />
            </li>
          ))}
        </ul>

        <Link href="/imoveis" className={`botao botao-preto ${s.botaoCelular}`}>
          Ver todos os imóveis
          <Icone nome="seta" className="seta" />
        </Link>
      </div>
    </section>
  )
}
