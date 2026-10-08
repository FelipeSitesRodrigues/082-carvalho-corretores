export type ItemMenu = { rotulo: string; href: string; secao?: string }

/** Menu do cabeçalho e do rodapé (mesma ordem do mockup). */
export const MENU: ItemMenu[] = [
  { rotulo: 'Início', href: '/', secao: 'inicio' },
  { rotulo: 'Comprar', href: '/imoveis?finalidade=venda' },
  { rotulo: 'Alugar', href: '/imoveis?finalidade=aluguel' },
  { rotulo: 'Vender', href: '/?quero=vender#contato' },
  { rotulo: 'Bairros', href: '/#bairros', secao: 'bairros' },
  { rotulo: 'Sobre', href: '/#sobre', secao: 'sobre' },
  { rotulo: 'Contato', href: '/#contato', secao: 'contato' },
]
