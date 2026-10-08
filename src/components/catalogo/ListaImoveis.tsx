import type { Imovel } from '@/lib/tipos'
import { CardImovel } from '../CardImovel'
import s from './Catalogo.module.css'

/** Grade de cards. Serve à página estática (fallback) e à busca no navegador. */
export function ListaImoveis({ imoveis, whatsapp, chave = '' }: { imoveis: Imovel[]; whatsapp: string; chave?: string }) {
  return (
    <ul role="list" className={s.grade} key={chave}>
      {imoveis.map((imovel, i) => (
        <li key={imovel.id} style={{ '--i': Math.min(i, 8) } as React.CSSProperties}>
          <CardImovel imovel={imovel} whatsapp={whatsapp} titulo="h2" sizes="(max-width: 640px) 92vw, (max-width: 1099px) 46vw, 300px" />
        </li>
      ))}
    </ul>
  )
}
