/**
 * O site funciona nos dois modos. Sem as duas variáveis, lê os imóveis de
 * demonstração; com elas, lê do Supabase. Nenhuma página precisa saber disso.
 */
export function supabaseConfigurado(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
