import NextLink from 'next/link'

/**
 * Link do Next sem pré-carregamento automático. O padrão baixa e processa a
 * página de cada link que aparece na tela, e na home isso dava 8 pedidos e
 * trabalho na thread principal bem na hora do carregamento (TBT). As páginas
 * são estáticas e leves: o clique abre rápido sem pré-carregar.
 */
export default function Link(props: React.ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />
}
