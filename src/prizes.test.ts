import { describe, expect, it } from 'vitest'
import { drawPrize, prizes, sectorCenter, validatePrizes } from './prizes'

describe('sorteio ponderado', () => {
  it('cobre todos os intervalos e seus limites', () => {
    const boundaries = [0, .1, .4, .6, .8, .999999]
    expect(boundaries.map(value => drawPrize(() => value).id)).toEqual(['agua', 'adesivo', 'semente', 'tente', 'marca', 'marca'])
    expect(prizes.map(p => sectorCenter(p.id))).toEqual([18, 90, 180, 252, 324])
  })
  it('rejeita configuração inválida', () => {
    expect(() => validatePrizes(prizes.map(p => ({ ...p, weight: p.weight + 1 })))).toThrow()
    expect(() => drawPrize(() => 1)).toThrow()
  })
  it('aproxima a distribuição esperada em 100.000 sorteios', () => {
    const counts = new Map(prizes.map(p => [p.id, 0]))
    for (let i = 0; i < 100_000; i++) {
      const id = drawPrize().id
      counts.set(id, counts.get(id)! + 1)
    }
    for (const prize of prizes) expect(counts.get(prize.id)! / 1000).toBeCloseTo(prize.weight, 0)
  })
})
