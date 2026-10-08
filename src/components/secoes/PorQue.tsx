import type { Foto as TFoto } from '@/lib/tipos'
import { Foto } from '../Foto'
import { Icone, type NomeIcone } from '../Icone'
import s from './PorQue.module.css'

const ITENS: { icone: NomeIcone; texto: string }[] = [
  { icone: 'casa', texto: 'Compra e aluguel com segurança' },
  { icone: 'documento', texto: 'Suporte em toda a negociação' },
  { icone: 'aperto', texto: 'Captação de imóveis para venda e locação' },
  { icone: 'pino', texto: 'Conhecimento local de Poá e região' },
]

/** Seção escura do mockup: texto à esquerda, quatro diferenciais à direita, prédio à noite ao fundo. */
export function PorQue({ fundo }: { fundo: TFoto | null }) {
  return (
    <section id="sobre" style={{ '--cv-d': '201px', '--cv-t': '408px', '--cv-m': '582px' } as React.CSSProperties} className={`cv escuro secao ${s.secao}`} aria-labelledby="titulo-sobre">
      {fundo && (
        <div className={s.fundo} aria-hidden="true">
          <Foto foto={fundo} sizes="(max-width: 899px) 100vw, 60vw" alt="" adiar />
        </div>
      )}
      <div className={`container ${s.grade}`}>
        <div data-revela>
          <p className="rotulo">Por que escolher a Carvalho</p>
          <h2 id="titulo-sobre" className="titulo-secao">
            Mais que imóveis,
            <br />
            <span className="destaque">pessoas e histórias</span>
          </h2>
          <p className={s.texto}>
            Atendimento próximo, transparente e com acompanhamento do início ao fim, seja para comprar, alugar ou vender.
          </p>
        </div>
        <ul role="list" className={s.itens}>
          {ITENS.map((item, i) => (
            <li key={item.icone} className={s.item} data-revela style={{ '--i': i } as React.CSSProperties}>
              <Icone nome={item.icone} className={s.icone} />
              <span>{item.texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
