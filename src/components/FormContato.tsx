'use client'

import Link from '@/components/Link'
import { useEffect, useRef, useState } from 'react'
import { Icone } from './Icone'
import s from './FormContato.module.css'

export const INTERESSES = [
  { valor: 'comprar', rotulo: 'Comprar um imóvel' },
  { valor: 'alugar', rotulo: 'Alugar um imóvel' },
  { valor: 'vender', rotulo: 'Vender meu imóvel' },
  { valor: 'anunciar-aluguel', rotulo: 'Colocar meu imóvel para alugar' },
  { valor: 'financiamento', rotulo: 'Simular um financiamento' },
] as const

function mascararTelefone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

type Erros = Partial<Record<'nome' | 'telefone', string>>

/**
 * O formulário só monta quando a seção chega perto da tela, quando alguém clica
 * num link #contato ou chega com #contato no endereço. No HTML inicial, o
 * preenchimento automático do Chrome forçava layout no fim do parse (91 ms com
 * CPU 4x no 080, memória form-autofill-layout-forcado). O lugar reserva a
 * altura do form montado, então nada pula.
 *
 * Envia por POST pra /atendimento numa aba nova: lá o lead é gravado (quando
 * o Supabase estiver ligado) e a pessoa cai no WhatsApp com a mensagem pronta,
 * sem perder o site.
 */
export function FormContato() {
  const lugar = useRef<HTMLDivElement>(null)
  const [montado, setMontado] = useState(false)
  const [interesse, setInteresse] = useState<string>('comprar')
  const [telefone, setTelefone] = useState('')
  const [erros, setErros] = useState<Erros>({})
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    const quero = new URLSearchParams(window.location.search).get('quero')
    if (quero && INTERESSES.some((i) => i.valor === quero)) setInteresse(quero)
    if (window.location.hash === '#contato' || quero) {
      setMontado(true)
      return
    }
    const clique = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href*="#contato"], a[href="#form-contato"]')
      if (a) setMontado(true)
    }
    document.addEventListener('click', clique, true)
    const io = new IntersectionObserver((entradas) => entradas.some((x) => x.isIntersecting) && setMontado(true), {
      rootMargin: '900px 0px',
    })
    if (lugar.current) io.observe(lugar.current)
    return () => {
      document.removeEventListener('click', clique, true)
      io.disconnect()
    }
  }, [])

  function aoEnviar(e: React.FormEvent<HTMLFormElement>) {
    const dados = new FormData(e.currentTarget)
    const nome = String(dados.get('nome') ?? '').trim()
    const digitos = String(dados.get('telefone') ?? '').replace(/\D/g, '')
    const novos: Erros = {}
    if (nome.length < 2) novos.nome = 'Escreva o seu nome.'
    if (digitos.length < 10) novos.telefone = 'Confira o telefone com DDD.'
    setErros(novos)
    if (Object.keys(novos).length) {
      e.preventDefault()
      const primeiro = e.currentTarget.querySelector<HTMLElement>(novos.nome ? '[name="nome"]' : '[name="telefone"]')
      primeiro?.focus()
      return
    }
    // deixa o POST seguir (abre o WhatsApp numa aba nova) e agradece aqui
    setTimeout(() => setEnviado(true), 50)
  }

  return (
    <div ref={lugar} id="form-contato" className={s.lugar}>
      {montado && !enviado && (
        <form className={s.form} method="post" action="/atendimento" target="_blank" onSubmit={aoEnviar} noValidate>
          <h3 className={s.titulo}>Ou deixe seus dados</h3>
          <input type="hidden" name="origem" value="contato" />
          <label className="campo">
            <span className="sr-only">Nome completo</span>
            <input
              className="entrada"
              name="nome"
              placeholder="Nome completo"
              autoComplete="name"
              maxLength={80}
              aria-invalid={erros.nome ? true : undefined}
              aria-describedby={erros.nome ? 'erro-nome' : undefined}
            />
            {erros.nome && (
              <small id="erro-nome" className={s.erro}>
                {erros.nome}
              </small>
            )}
          </label>
          <label className="campo">
            <span className="sr-only">Telefone (WhatsApp)</span>
            <input
              className="entrada"
              name="telefone"
              type="tel"
              inputMode="tel"
              placeholder="Telefone (WhatsApp)"
              autoComplete="tel-national"
              value={telefone}
              onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
              aria-invalid={erros.telefone ? true : undefined}
              aria-describedby={erros.telefone ? 'erro-telefone' : undefined}
            />
            {erros.telefone && (
              <small id="erro-telefone" className={s.erro}>
                {erros.telefone}
              </small>
            )}
          </label>
          <label className="campo">
            <span>Quero</span>
            <select className="entrada" name="interesse" value={interesse} onChange={(e) => setInteresse(e.target.value)}>
              {INTERESSES.map((i) => (
                <option key={i.valor} value={i.valor}>
                  {i.rotulo}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="botao botao-ciano">
            Enviar mensagem
            <Icone nome="seta" className="seta" />
          </button>
          <p className={s.lgpd}>
            Seus dados só são usados para falar com você. <Link href="/politica-de-privacidade">Política de privacidade</Link>.
          </p>
        </form>
      )}
      {enviado && (
        <div className={s.enviado} role="status">
          <Icone nome="check" className={s.ok} />
          <h3 className={s.titulo}>Pronto, recebemos!</h3>
          <p>Abrimos o WhatsApp numa aba nova com a sua mensagem. Se não abriu, é só chamar no número ao lado.</p>
          <button type="button" className={s.denovo} onClick={() => setEnviado(false)}>
            Enviar outra mensagem
          </button>
        </div>
      )}
      <noscript>
        <p className={s.semJs}>Para falar com a gente, use o botão do WhatsApp.</p>
      </noscript>
    </div>
  )
}
