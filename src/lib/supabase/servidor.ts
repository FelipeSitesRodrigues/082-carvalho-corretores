import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente do PAINEL, com sessão em cookie. Pronto para quando o painel entrar
 * (fase seguinte, portado da 057). As páginas públicas usam criarClientePublico().
 */
export async function criarClienteServidor() {
  const cookieStore = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) cookieStore.set(name, value, options)
        } catch {
          // Server Component não escreve cookie; quem renova a sessão é o proxy do painel.
        }
      },
    },
  })
}

export type Sessao = { userId: string; email: string; nome: string; role: 'admin' | 'corretor' }

/** Quem está logado e se faz parte da equipe. Sempre getUser(), nunca getSession(). */
export async function sessaoDaEquipe(): Promise<Sessao | null> {
  const sb = await criarClienteServidor()
  const {
    data: { user },
  } = await sb.auth.getUser()
  if (!user) return null
  const { data: perfil } = await sb.from('perfis').select('id, nome, role, ativo').eq('id', user.id).maybeSingle()
  if (!perfil || !perfil.ativo) return null
  return {
    userId: user.id,
    email: user.email ?? '',
    nome: perfil.nome || user.email?.split('@')[0] || 'equipe',
    role: perfil.role as Sessao['role'],
  }
}
