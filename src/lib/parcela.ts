/**
 * Conta do simulador de financiamento imobiliário.
 *
 * Duas tabelas, as que os bancos usam no Brasil:
 * - Price: parcela fixa do começo ao fim
 * - SAC: amortização constante, a primeira parcela é a maior e cai todo mês
 *
 * A taxa é de REFERÊNCIA (config.taxaJurosAnual, 11% ao ano por padrão), sem
 * seguro, taxa de administração nem TR. Por isso o site chama o resultado de
 * estimativa e manda a pessoa pro corretor.
 */

export type Simulacao = {
  financiado: number
  meses: number
  taxaMensal: number
  parcelaPrice: number
  primeiraSac: number
  ultimaSac: number
}

export function taxaMensal(taxaAnualPct: number): number {
  return Math.pow(1 + taxaAnualPct / 100, 1 / 12) - 1
}

export function simular(valorImovel: number, entrada: number, anos: number, taxaAnualPct: number): Simulacao | null {
  const financiado = Math.max(0, valorImovel - entrada)
  const meses = Math.round(anos * 12)
  if (!financiado || !meses) return null
  const i = taxaMensal(taxaAnualPct)
  const parcelaPrice = i === 0 ? financiado / meses : (financiado * i) / (1 - Math.pow(1 + i, -meses))
  const amortizacao = financiado / meses
  return {
    financiado,
    meses,
    taxaMensal: i,
    parcelaPrice,
    primeiraSac: amortizacao + financiado * i,
    ultimaSac: amortizacao + amortizacao * i,
  }
}

/** "R$ 320.000" ou "320000" ou "320.000,00" viram 320000. */
export function lerDinheiro(texto: string): number {
  const limpo = texto.replace(/[^\d,]/g, '').split(',')[0]
  return Number(limpo || 0)
}
