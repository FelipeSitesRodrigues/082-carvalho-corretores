'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useRef, useTransition } from 'react'
import type { Bairro, Imovel } from '@/lib/tipos'
import { aplicarFiltros, contarAtivos, escreverFiltros, FILTROS_VAZIOS, lerFiltros, TETOS, type Filtros } from '@/lib/filtros'
import { linkWhatsApp, moeda } from '@/lib/formato'
import { Icone } from '../Icone'
import { ListaImoveis } from './ListaImoveis'
import s from './Catalogo.module.css'

type Props = { imoveis: Imovel[]; bairros: Bairro[]; whatsapp: string }

const rotuloTeto = (v: number, fin: 'venda' | 'aluguel') =>
  fin === 'venda' ? (v >= 1000000 ? `Até R$ 1 milhão` : `Até R$ ${v / 1000} mil`) : `Até ${moeda(v)}`

/**
 * Busca da página /imoveis: o bloco branco com finalidade, tipo, bairro,
 * quartos e valor, mais a ordenação. Filtra no navegador (a lista inteira já
 * veio na página estática) e escreve tudo no endereço.
 */
export function Catalogo({ imoveis, bairros, whatsapp }: Props) {
  const params = useSearchParams()
  const router = useRouter()
  const caminho = usePathname()
  const [, iniciar] = useTransition()
  const resultados = useRef<HTMLDivElement>(null)
  const filtros = useMemo(() => lerFiltros(new URLSearchParams(params.toString())), [params])
  const lista = useMemo(() => aplicarFiltros(imoveis, filtros), [imoveis, filtros])
  const ativos = contarAtivos(filtros)

  function mudar(parcial: Partial<Filtros>) {
    const novo = { ...filtros, ...parcial }
    if ('finalidade' in parcial) novo.ate = 0
    iniciar(() => router.replace(`${caminho}${escreverFiltros(novo)}`, { scroll: false }))
  }

  const nomeBairro = bairros.find((b) => b.slug === filtros.bairro)?.nome
  const pedido = [
    'Olá! Procuro',
    filtros.tipo ? (filtros.tipo === 'casa' ? 'uma casa' : 'um apartamento') : 'um imóvel',
    filtros.finalidade === 'aluguel' ? 'para alugar' : filtros.finalidade === 'venda' ? 'para comprar' : '',
    nomeBairro ? `no bairro ${nomeBairro}` : 'em Poá',
    filtros.quartos ? `com ${filtros.quartos} quartos ou mais` : '',
    filtros.ate && filtros.finalidade ? `até ${moeda(filtros.ate)}` : '',
    'e não achei no site. Vocês têm alguma opção?',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <form
        className={s.busca}
        role="search"
        aria-label="Buscar imóveis"
        onSubmit={(e) => {
          e.preventDefault()
          resultados.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
      >
        <div className={s.abas} role="radiogroup" aria-label="Finalidade">
          {(
            [
              ['', 'Todos'],
              ['venda', 'Comprar'],
              ['aluguel', 'Alugar'],
            ] as const
          ).map(([valor, rotulo]) => (
            <button
              key={rotulo}
              type="button"
              role="radio"
              aria-checked={filtros.finalidade === valor}
              className={s.aba}
              onClick={() => mudar({ finalidade: valor })}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <div className={s.campos}>
          <label className={s.campo}>
            <span>Tipo</span>
            <select className="entrada" value={filtros.tipo} onChange={(e) => mudar({ tipo: e.target.value as Filtros['tipo'] })}>
              <option value="">Todos os tipos</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
            </select>
          </label>
          <label className={s.campo}>
            <span>Bairro</span>
            <select className="entrada" value={filtros.bairro} onChange={(e) => mudar({ bairro: e.target.value })}>
              <option value="">Todos os bairros</option>
              {bairros.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.nome}
                </option>
              ))}
            </select>
          </label>
          <label className={s.campo}>
            <span>Quartos</span>
            <select className="entrada" value={filtros.quartos} onChange={(e) => mudar({ quartos: Number(e.target.value) })}>
              <option value={0}>Qualquer</option>
              <option value={1}>1 ou mais</option>
              <option value={2}>2 ou mais</option>
              <option value={3}>3 ou mais</option>
            </select>
          </label>
          <label className={s.campo}>
            <span>Valor</span>
            <select
              className="entrada"
              value={filtros.finalidade ? filtros.ate : 0}
              disabled={!filtros.finalidade}
              title={filtros.finalidade ? undefined : 'Escolha comprar ou alugar para filtrar por valor'}
              onChange={(e) => mudar({ ate: Number(e.target.value) })}
            >
              <option value={0}>Qualquer valor</option>
              {filtros.finalidade &&
                TETOS[filtros.finalidade].map((v) => (
                  <option key={v} value={v}>
                    {rotuloTeto(v, filtros.finalidade as 'venda' | 'aluguel')}
                  </option>
                ))}
            </select>
          </label>
          <button type="submit" className={`botao botao-ciano ${s.buscar}`}>
            <Icone nome="lupa" />
            Buscar
          </button>
        </div>
      </form>

      <div ref={resultados} className={s.barra}>
        <p aria-live="polite" className={s.contagem}>
          <strong>{lista.length}</strong> {lista.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
          {ativos > 0 && (
            <button type="button" className={s.limpar} onClick={() => mudar({ ...FILTROS_VAZIOS, ordem: filtros.ordem })}>
              Limpar filtros
            </button>
          )}
        </p>
        <label className={s.ordem}>
          <span>Ordenar por</span>
          <select className="entrada" value={filtros.ordem} onChange={(e) => mudar({ ordem: e.target.value as Filtros['ordem'] })}>
            <option value="recentes">Mais recentes</option>
            <option value="menor-preco">Menor preço</option>
            <option value="maior-preco">Maior preço</option>
            <option value="maior-area">Maior área</option>
          </select>
        </label>
      </div>

      {lista.length ? (
        <ListaImoveis imoveis={lista} whatsapp={whatsapp} chave={escreverFiltros(filtros)} />
      ) : (
        <div className={s.vazio}>
          <Icone nome="lupa" className={s.vazioIcone} />
          <h2>Nenhum imóvel com esses filtros</h2>
          <p>O estoque muda toda semana. Conte o que você procura e o corretor avisa quando aparecer.</p>
          <div className={s.vazioBotoes}>
            <a href={linkWhatsApp(whatsapp, pedido)} className="botao botao-verde" target="_blank" rel="noopener noreferrer">
              <Icone nome="whatsapp" />
              Pedir ao corretor
            </a>
            <button type="button" className="botao botao-contorno" onClick={() => mudar({ ...FILTROS_VAZIOS })}>
              Limpar filtros
            </button>
          </div>
        </div>
      )}
    </>
  )
}
