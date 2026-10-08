import { Hero } from '@/components/Hero'
import { Vitrine } from '@/components/secoes/Vitrine'
import { PorQue } from '@/components/secoes/PorQue'
import { SecaoSimulador } from '@/components/secoes/SecaoSimulador'
import { Bairros } from '@/components/secoes/Bairros'
import { ComoFunciona } from '@/components/secoes/ComoFunciona'
import { Contato } from '@/components/secoes/Contato'
import { buscarConfig, listarBairros, listarDestaques } from '@/lib/dados'
import fotos from '@/lib/dados/fotos.gerado.json'
import type { Foto } from '@/lib/tipos'

// Com Supabase, a home se refaz sozinha a cada 5 minutos (ISR).
export const revalidate = 300

const FOTOS = fotos as Record<string, Foto[]>

/** Ordem e cores do mockup: preto, gelo, preto, ciano, gelo, preto, gelo, preto. */
export default async function Inicio() {
  const [config, destaques, bairros] = await Promise.all([buscarConfig(), listarDestaques(4), listarBairros()])
  return (
    <>
      <Hero config={config} desktop={FOTOS['hero/desktop']?.[0] ?? null} celular={FOTOS['hero/mobile']?.[0] ?? null} />
      <Vitrine imoveis={destaques} whatsapp={config.whatsapp} />
      <PorQue fundo={FOTOS['extras/por-que-fundo']?.[0] ?? null} />
      <SecaoSimulador whatsapp={config.whatsapp} taxaAnual={config.taxaJurosAnual} />
      <Bairros bairros={bairros} />
      <ComoFunciona />
      <Contato config={config} foto={FOTOS['extras/contato']?.[0] ?? null} />
    </>
  )
}
