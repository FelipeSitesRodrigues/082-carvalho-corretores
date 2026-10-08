import type { Metadata } from 'next'
import { Suspense } from 'react'
import { FaixaTopo } from '@/components/FaixaTopo'
import { Catalogo } from '@/components/catalogo/Catalogo'
import { ListaImoveis } from '@/components/catalogo/ListaImoveis'
import { buscarConfig, listarBairros, listarImoveis } from '@/lib/dados'
import s from '@/components/catalogo/Catalogo.module.css'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Imóveis à venda e para alugar em Poá, SP',
  description:
    'Apartamentos e casas à venda e para alugar em Poá, SP: Centro, Calmon Viana, Vila Perracini, Jardim América, Vila Amélia e Vila Júlia. Filtre por bairro, quartos e valor.',
  alternates: { canonical: '/imoveis' },
}

/**
 * Página estática com a lista inteira (é o que o Google e quem está sem JS
 * veem). A busca filtra no navegador e grava os filtros no endereço.
 */
export default async function PaginaImoveis() {
  const [imoveis, bairros, config] = await Promise.all([listarImoveis(), listarBairros(), buscarConfig()])
  return (
    <>
      <FaixaTopo
        trilha={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Imóveis' }]}
        rotulo="Imóveis"
        titulo={
          <>
            Imóveis em <span className="destaque">Poá</span>
          </>
        }
        texto="Apartamentos e casas para comprar ou alugar, com corretor da primeira visita até a entrega da chave."
      />
      <div className="claro">
        <div className="container" style={{ paddingBottom: 'var(--secao-y)' }}>
          <Suspense
            fallback={
              <>
                <div className={s.buscaReserva} aria-hidden="true" />
                <div className={s.barra}>
                  <p className={s.contagem}>
                    <strong>{imoveis.length}</strong> imóveis
                  </p>
                </div>
                <ListaImoveis imoveis={imoveis} whatsapp={config.whatsapp} />
              </>
            }
          >
            <Catalogo imoveis={imoveis} bairros={bairros} whatsapp={config.whatsapp} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
