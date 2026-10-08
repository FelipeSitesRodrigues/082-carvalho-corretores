import type { ConfigImobiliaria, Foto as TFoto } from '@/lib/tipos'
import { linkWhatsApp, MENSAGEM_GERAL } from '@/lib/formato'
import { Foto } from '../Foto'
import { FormContato } from '../FormContato'
import { Icone } from '../Icone'
import s from './Contato.module.css'

/** "Fale conosco" do mockup: texto e botões à esquerda; foto e formulário à direita. */
export function Contato({ config, foto }: { config: ConfigImobiliaria; foto: TFoto | null }) {
  return (
    <section id="contato" style={{ '--cv-d': '406px', '--cv-t': '696px', '--cv-m': '1032px' } as React.CSSProperties} className="cv claro secao" aria-labelledby="titulo-contato">
      <div className={`container ${s.grade}`}>
        <div data-revela>
          <p className="rotulo">Fale conosco</p>
          <h2 id="titulo-contato" className="titulo-secao">
            Vamos encontrar
            <br />o <span className="destaque">seu próximo imóvel?</span>
          </h2>
          <p className={s.texto}>Fale com a nossa equipe pelo WhatsApp ou preencha o formulário e nós entramos em contato.</p>
          <div className={s.botoes}>
            <a href={linkWhatsApp(config.whatsapp, MENSAGEM_GERAL)} className="botao botao-verde" target="_blank" rel="noopener noreferrer">
              <Icone nome="whatsapp" />
              {config.whatsappExibicao}
            </a>
            <a href="#form-contato" className="botao botao-contorno">
              Enviar mensagem
            </a>
          </div>
        </div>

        <div className={s.midia} data-revela style={{ '--i': 1 } as React.CSSProperties}>
          <Foto foto={foto} sizes="(max-width: 899px) 100vw, 420px" className={s.foto} adiar />
          <div className={s.cartao}>
            <FormContato />
          </div>
        </div>
      </div>
    </section>
  )
}
