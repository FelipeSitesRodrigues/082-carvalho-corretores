import { Icone, type NomeIcone } from '../Icone'
import s from './ComoFunciona.module.css'

const PASSOS: { icone: NomeIcone; titulo: string; texto: string }[] = [
  { icone: 'conversa', titulo: 'Você fala com a gente', texto: 'Entendemos o seu objetivo e seu perfil.' },
  { icone: 'lupa', titulo: 'Selecionamos as opções', texto: 'Indicamos os imóveis ideais para você.' },
  { icone: 'calendario', titulo: 'Você visita', texto: 'Acompanhamos em todas as visitas.' },
  { icone: 'documentoOk', titulo: 'Fechamos o negócio', texto: 'Suporte até a entrega da chave.' },
]

/** Quatro passos numerados com seta entre eles; no celular viram uma linha vertical. */
export function ComoFunciona() {
  return (
    <section id="como-funciona" style={{ '--cv-d': '221px', '--cv-t': '342px', '--cv-m': '544px' } as React.CSSProperties} className={`cv escuro secao ${s.secao}`} aria-labelledby="titulo-como">
      <div className={`container ${s.grade}`}>
        <div data-revela>
          <p className="rotulo">Como funciona</p>
          <h2 id="titulo-como" className="titulo-secao">
            Do primeiro contato
            <br />
            até a <span className="destaque">entrega da chave</span>
          </h2>
        </div>
        <ol role="list" className={s.passos}>
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className={s.passo} data-revela style={{ '--i': i } as React.CSSProperties}>
              <span className={s.circulo}>
                <Icone nome={p.icone} />
                <span className={s.numero} aria-hidden="true">
                  {i + 1}
                </span>
              </span>
              <h3 className={s.titulo}>
                <span className="sr-only">Passo {i + 1}: </span>
                {p.titulo}
              </h3>
              <p className={s.texto}>{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
