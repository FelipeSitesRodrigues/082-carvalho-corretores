import { Simulador } from '../Simulador'
import s from './SecaoSimulador.module.css'

/** Faixa ciano do mockup: título à esquerda, campos à direita. */
export function SecaoSimulador({ whatsapp, taxaAnual }: { whatsapp: string; taxaAnual: number }) {
  return (
    <section id="simulador" style={{ '--cv-d': '197px', '--cv-t': '402px', '--cv-m': '498px' } as React.CSSProperties} className={`cv sobre-ciano ${s.secao}`} aria-labelledby="titulo-simulador">
      <div className={`container ${s.grade}`}>
        <div data-revela>
          <p className="rotulo">Simulador</p>
          <h2 id="titulo-simulador" className="titulo-secao">
            Simule o seu
            <br />
            financiamento
          </h2>
          <p className={s.texto}>Descubra uma estimativa das parcelas do seu imóvel de forma rápida e simples.</p>
        </div>
        <div data-revela style={{ '--i': 1 } as React.CSSProperties}>
          <Simulador whatsapp={whatsapp} taxaAnual={taxaAnual} />
        </div>
      </div>
    </section>
  )
}
