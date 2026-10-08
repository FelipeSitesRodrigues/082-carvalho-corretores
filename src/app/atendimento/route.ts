import { createHash } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'
import { buscarConfig } from '@/lib/dados'
import { supabaseConfigurado } from '@/lib/supabase/ambiente'
import { MENSAGEM_GERAL } from '@/lib/formato'

/**
 * Porta única do formulário de contato (mesmo desenho da 057).
 *
 * POST: valida, grava o lead (quando o Supabase estiver ligado) e manda a
 * pessoa pro WhatsApp com a mensagem pronta. Se o banco recusar ou estiver
 * fora, a pessoa vai pro WhatsApp do mesmo jeito: contato perdido por causa de
 * cadastro seria o pior erro possível aqui.
 */
export const dynamic = 'force-dynamic'

const INTERESSES: Record<string, string> = {
  comprar: 'comprar um imóvel',
  alugar: 'alugar um imóvel',
  vender: 'vender meu imóvel',
  'anunciar-aluguel': 'colocar meu imóvel para alugar',
  financiamento: 'simular um financiamento',
}
const ORIGENS = ['contato', 'imovel', 'simulador'] as const
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  const config = await buscarConfig()
  let form: FormData | null = null
  try {
    form = await request.formData()
  } catch {
    return irProWhatsApp(config.whatsapp, MENSAGEM_GERAL)
  }

  const texto = (chave: string) => String(form?.get(chave) ?? '').trim()
  // tira o que vira formatação no WhatsApp e quebra de linha
  const nome = texto('nome').replace(/[*_~`]/g, '').replace(/\s+/g, ' ').slice(0, 80)
  const telefone = texto('telefone').replace(/\D/g, '').slice(0, 15)
  const interesse = INTERESSES[texto('interesse')] ? texto('interesse') : 'comprar'
  const origem = (ORIGENS as readonly string[]).includes(texto('origem')) ? texto('origem') : 'contato'
  const imovelId = texto('imovel')

  const mensagem =
    nome.length >= 2
      ? `Olá! Meu nome é ${nome}. Vim pelo site da Carvalho Corretores e quero ${INTERESSES[interesse]}.`
      : MENSAGEM_GERAL

  if (supabaseConfigurado() && nome.length >= 2 && telefone.length >= 10) {
    try {
      const { criarClientePublico } = await import('@/lib/supabase/publico')
      const { error } = await criarClientePublico().rpc('registrar_lead', {
        p_nome: nome,
        p_telefone: telefone,
        p_interesse: interesse,
        p_mensagem: mensagem,
        p_imovel_id: UUID.test(imovelId) ? imovelId : null,
        p_origem: origem,
        p_ip_hash: hashDoIp(request),
        p_user_agent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
      })
      if (error) console.error('registrar_lead', error.message)
    } catch (e) {
      console.error('registrar_lead', e)
    }
  }

  return irProWhatsApp(config.whatsapp, mensagem)
}

export async function GET() {
  const config = await buscarConfig()
  return irProWhatsApp(config.whatsapp, MENSAGEM_GERAL)
}

function irProWhatsApp(numero: string, mensagem: string) {
  const destino = `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`
  // 303: depois do POST o navegador segue com GET
  const resposta = NextResponse.redirect(destino, 303)
  resposta.headers.set('Cache-Control', 'no-store, max-age=0')
  return resposta
}

/** O IP nunca é gravado. O hash muda todo dia: serve pra frear robô, não pra seguir ninguém. */
function hashDoIp(request: NextRequest): string | null {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (!ip) return null
  const dia = new Date().toISOString().slice(0, 10)
  return createHash('sha256').update(`${ip}|${dia}|carvalho`).digest('hex')
}
