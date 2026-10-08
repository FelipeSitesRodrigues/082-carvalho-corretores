import Link from '@/components/Link'
import type { Imovel } from '@/lib/tipos'
import { linkWhatsApp, mensagemImovel, numero, plural, precoImovel } from '@/lib/formato'
import { Foto } from './Foto'
import { Icone } from './Icone'
import s from './CardImovel.module.css'

type Props = {
  imovel: Imovel
  whatsapp: string
  /** sizes da foto, depende da grade onde o card está */
  sizes?: string
  titulo?: 'h2' | 'h3'
  /** foto entra depois do load (home e parecidos); na lista ela é o LCP */
  adiar?: boolean
}

/**
 * Card do mockup: foto com selo VENDA/ALUGUEL, título, bairro, quartos, vagas,
 * metragem e preço. O card inteiro leva pra página do imóvel (link esticado
 * no título) e o botão redondo abre o WhatsApp com a mensagem daquele imóvel
 * (regra da casa: todo item de serviço tem o seu WhatsApp).
 */
export function CardImovel({ imovel, whatsapp, sizes = '(max-width: 640px) 82vw, (max-width: 1099px) 46vw, 300px', titulo = 'h3', adiar = false }: Props) {
  const preco = precoImovel(imovel)
  const href = `/imoveis/${imovel.slug}`
  const Titulo = titulo
  return (
    <article className={s.card}>
      <div className={s.capa}>
        <Foto foto={imovel.fotos[0]} sizes={sizes} className={s.foto} adiar={adiar} />
        <span className={s.selo} data-finalidade={imovel.finalidade}>
          {imovel.finalidade === 'venda' ? 'Venda' : 'Aluguel'}
        </span>
      </div>
      <div className={s.corpo}>
        <Titulo className={s.titulo}>
          <Link href={href} className={s.link}>
            {imovel.titulo}
          </Link>
        </Titulo>
        <p className={s.local}>
          {imovel.bairro.nome}, {imovel.cidade} - {imovel.uf}
        </p>
        <ul role="list" className={s.atributos}>
          <li>
            <Icone nome="cama" />
            {plural(imovel.quartos, 'quarto', 'quartos')}
          </li>
          <li>
            <Icone nome="carro" />
            {plural(imovel.vagas, 'vaga', 'vagas')}
          </li>
          <li>
            <Icone nome="area" />
            {numero(imovel.areaM2)} m²
          </li>
        </ul>
        <div className={s.rodape}>
          <p className={s.preco}>
            {preco.valor}
            {preco.sufixo && <span> {preco.sufixo}</span>}
          </p>
          <a
            href={linkWhatsApp(whatsapp, mensagemImovel(imovel))}
            className={s.zap}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Perguntar no WhatsApp sobre ${imovel.titulo}`}
          >
            <Icone nome="whatsapp" />
          </a>
        </div>
      </div>
    </article>
  )
}
