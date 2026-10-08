import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de LEITURA PÚBLICA, usado pelas páginas do site (mesmo desenho da 057).
 *
 * Não lê nem escreve cookie de propósito: cookie tornaria a página dinâmica e
 * mataria o ISR. Tudo o que ele enxerga é o que a RLS libera para o papel anon:
 * imóvel publicado, foto de imóvel publicado, bairro ativo e config pública.
 *
 * Nunca usar este cliente para escrever. Lead entra pela função registrar_lead
 * (security definer, valida antes de gravar) e o resto só pelo painel.
 */
export function criarClientePublico() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Faltam NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY no ambiente.')
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

/** URL pública de um arquivo do bucket `imoveis`. Caminho local ("/img/...") passa direto. */
export function urlDaFoto(path: string): string {
  if (path.startsWith('/') || path.startsWith('http')) return path
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, '')
  return `${base}/storage/v1/object/public/imoveis/${path}`
}
