import Link from '@/components/Link'
import type { Bairro, ConfigImobiliaria } from '@/lib/tipos'
import { linkWhatsApp, MENSAGEM_GERAL } from '@/lib/formato'
import { Icone, type NomeIcone } from './Icone'
import { MENU } from '@/lib/menu'
import s from './Rodape.module.css'

export function Rodape({ config, bairros }: { config: ConfigImobiliaria; bairros: Bairro[] }) {
  const zap = linkWhatsApp(config.whatsapp, MENSAGEM_GERAL)
  const contatos: { icone: NomeIcone; texto: string; href?: string }[] = [
    { icone: 'whatsapp', texto: config.whatsappExibicao, href: zap },
    { icone: 'pino', texto: config.endereco },
    { icone: 'documento', texto: config.creci },
    ...config.horarios.map((h) => ({ icone: 'relogio' as NomeIcone, texto: `${h.dias}, ${h.horas}` })),
  ]
  const redes: { icone: NomeIcone; rotulo: string; href: string }[] = [
    ...(config.instagram ? [{ icone: 'instagram' as NomeIcone, rotulo: 'Instagram', href: config.instagram }] : []),
    ...(config.facebook ? [{ icone: 'facebook' as NomeIcone, rotulo: 'Facebook', href: config.facebook }] : []),
    { icone: 'whatsapp', rotulo: 'WhatsApp', href: zap },
  ]

  return (
    <footer className={`cv ${s.rodape}`} style={{ '--cv-d': '442px', '--cv-t': '927px', '--cv-m': '998px' } as React.CSSProperties}>
      <div className={`container ${s.grade}`}>
        <div className={s.marca}>
          <img src="/logo-sobre-escuro.svg" width={233} height={44} alt="Carvalho Corretores de Imóveis" loading="lazy" decoding="async" />
          <p>
            Imobiliária em {config.cidade}, {config.uf}. Apartamentos e casas para comprar e alugar, com atendimento próximo e
            acompanhamento em todas as etapas.
          </p>
          <ul role="list" className={s.redes}>
            {redes.map((r) => (
              <li key={r.rotulo}>
                <a href={r.href} target="_blank" rel="noopener noreferrer" aria-label={r.rotulo}>
                  <Icone nome={r.icone} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Rodapé" className={s.coluna}>
          <h2 className={s.tituloColuna}>Navegação</h2>
          <ul role="list">
            {MENU.map((m) => (
              <li key={m.rotulo}>
                <Link href={m.href}>{m.rotulo}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={s.coluna}>
          <h2 className={s.tituloColuna}>Bairros</h2>
          <ul role="list">
            {bairros.map((b) => (
              <li key={b.slug}>
                <Link href={`/imoveis?bairro=${b.slug}`}>{b.nome}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={s.coluna}>
          <h2 className={s.tituloColuna}>Contato</h2>
          <ul role="list" className={s.contatos}>
            {contatos.map((c) => (
              <li key={c.texto}>
                <Icone nome={c.icone} />
                {c.href ? (
                  <a href={c.href} target="_blank" rel="noopener noreferrer">
                    {c.texto}
                  </a>
                ) : (
                  <span>{c.texto}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`container ${s.base}`}>
        <p>© 2026 {config.nomeCompleto}. Todos os direitos reservados.</p>
        <Link href="/politica-de-privacidade">Política de privacidade</Link>
      </div>
    </footer>
  )
}
