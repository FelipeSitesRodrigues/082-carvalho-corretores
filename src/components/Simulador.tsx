'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { lerDinheiro, simular, type Simulacao } from '@/lib/parcela'
import { linkWhatsApp, moeda } from '@/lib/formato'
import { Icone } from './Icone'
import s from './Simulador.module.css'

const PRAZOS = [10, 15, 20, 25, 30, 35]
const formatar = (v: number) => (v ? moeda(v) : '')

/** Número que corre do valor anterior até o novo em ~420 ms (parado se pedirem menos movimento). */
function useNumeroAnimado(alvo: number) {
  const [valor, setValor] = useState(alvo)
  const anterior = useRef(alvo)
  useEffect(() => {
    const de = anterior.current
    anterior.current = alvo
    if (de === alvo || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValor(alvo)
      return
    }
    const inicio = performance.now()
    let quadro = 0
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / 420)
      const e = 1 - Math.pow(1 - t, 4)
      setValor(de + (alvo - de) * e)
      if (t < 1) quadro = requestAnimationFrame(passo)
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [alvo])
  return valor
}

type Props = { whatsapp: string; taxaAnual: number }

export function Simulador({ whatsapp, taxaAnual }: Props) {
  const id = useId()
  const [valorTexto, setValorTexto] = useState(formatar(320000))
  const [entradaTexto, setEntradaTexto] = useState(formatar(64000))
  const [anos, setAnos] = useState(30)
  const [resultado, setResultado] = useState<Simulacao | null>(null)
  const [erro, setErro] = useState('')
  const parcela = useNumeroAnimado(resultado?.parcelaPrice ?? 0)

  // Veio da página de um imóvel: "/?valor=320000#simulador" já chega preenchido.
  useEffect(() => {
    const valor = Number(new URLSearchParams(window.location.search).get('valor'))
    if (valor > 0) {
      setValorTexto(formatar(valor))
      setEntradaTexto(formatar(Math.round(valor * 0.2)))
    }
  }, [])

  const valor = lerDinheiro(valorTexto)
  const entrada = lerDinheiro(entradaTexto)

  function calcular() {
    if (valor < 20000) return setErro('Informe o valor do imóvel.')
    if (entrada >= valor) return setErro('A entrada precisa ser menor que o valor do imóvel.')
    setErro('')
    setResultado(simular(valor, entrada, anos, taxaAnual))
  }

  // Depois da primeira simulação, o resultado acompanha o que a pessoa digita.
  useEffect(() => {
    if (!resultado) return
    if (valor >= 20000 && entrada < valor) setResultado(simular(valor, entrada, anos, taxaAnual))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor, entrada, anos])

  const entradaBaixa = valor > 0 && entrada < valor * 0.2
  const mensagem = resultado
    ? `Olá! Simulei no site um financiamento: imóvel de ${moeda(valor)}, entrada de ${moeda(entrada)}, em ${anos} anos (parcela estimada de ${moeda(resultado.parcelaPrice)}). Pode me ajudar com a simulação real?`
    : ''

  return (
    <div className={s.simulador}>
      <form
        className={s.form}
        onSubmit={(e) => {
          e.preventDefault()
          calcular()
        }}
        noValidate
      >
        <label className={`campo ${s.campo}`}>
          <span>Valor do imóvel</span>
          <input
            className="entrada"
            inputMode="numeric"
            autoComplete="off"
            value={valorTexto}
            onChange={(e) => setValorTexto(formatar(lerDinheiro(e.target.value)))}
            aria-invalid={erro.includes('valor do imóvel') || undefined}
            aria-describedby={erro ? `${id}-erro` : undefined}
          />
        </label>
        <label className={`campo ${s.campo}`}>
          <span>Entrada</span>
          <input
            className="entrada"
            inputMode="numeric"
            autoComplete="off"
            value={entradaTexto}
            onChange={(e) => setEntradaTexto(formatar(lerDinheiro(e.target.value)))}
            aria-invalid={erro.includes('entrada') || undefined}
            aria-describedby={erro ? `${id}-erro` : undefined}
          />
        </label>
        <label className={`campo ${s.campo}`}>
          <span>Prazo</span>
          <select className="entrada" value={anos} onChange={(e) => setAnos(Number(e.target.value))}>
            {PRAZOS.map((p) => (
              <option key={p} value={p}>
                {p} anos
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={`botao botao-preto ${s.botao}`}>
          Simular parcelas
          <Icone nome="seta" className="seta" />
        </button>
        <p className={s.nota}>Simulação ilustrativa. Sujeita à análise de crédito.</p>
        {erro && (
          <p id={`${id}-erro`} className={s.erro} role="alert">
            {erro}
          </p>
        )}
      </form>

      <div className={s.saida} aria-live="polite">
        {resultado && (
          <div className={s.resultado}>
            <p className={s.legenda}>Parcela estimada</p>
            <p className={s.parcela}>
              {moeda(Math.round(parcela))}
              <span> / mês</span>
            </p>
            <p className={s.detalhe}>
              {moeda(resultado.financiado)} financiados em {resultado.meses} meses, tabela Price, {String(taxaAnual).replace('.', ',')}% ao
              ano de referência. No SAC, a 1ª parcela fica perto de {moeda(Math.round(resultado.primeiraSac))} e cai todo mês.
            </p>
            {entradaBaixa && (
              <p className={s.aviso}>A maioria dos bancos pede entrada de pelo menos 20% ({moeda(Math.round(valor * 0.2))}).</p>
            )}
            <a href={linkWhatsApp(whatsapp, mensagem)} className={`botao botao-verde ${s.zap}`} target="_blank" rel="noopener noreferrer">
              <Icone nome="whatsapp" />
              Simular com um corretor
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
