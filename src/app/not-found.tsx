import Link from '@/components/Link'
import { FaixaTopo } from '@/components/FaixaTopo'
import { Icone } from '@/components/Icone'

export default function NaoEncontrado() {
  return (
    <>
      <FaixaTopo
        compacta
        trilha={[{ rotulo: 'Início', href: '/' }, { rotulo: 'Página não encontrada' }]}
        rotulo="Erro 404"
        titulo="Essa página não existe mais"
        texto="Talvez o imóvel já tenha sido vendido ou alugado. Veja os que estão disponíveis agora."
      />
      <div className="claro">
        <div className="container" style={{ paddingBlock: '56px var(--secao-y)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/imoveis" className="botao botao-ciano">
            Ver imóveis disponíveis
            <Icone nome="seta" className="seta" />
          </Link>
          <Link href="/" className="botao botao-contorno">
            Voltar ao início
          </Link>
        </div>
      </div>
    </>
  )
}
