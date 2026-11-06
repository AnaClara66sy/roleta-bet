export type PrizeId = 'agua' | 'adesivo' | 'semente' | 'tente' | 'marca'
export type Prize = { id: PrizeId; label: string; icon: string; weight: number; color: string; message: string }

export const prizes: readonly Prize[] = [
  { id: 'agua', label: 'Água', icon: '💧', weight: 10, color: '#8fcbd7', message: 'Parabéns! Você ganhou uma água! 💧' },
  { id: 'adesivo', label: 'Adesivo', icon: '⭐', weight: 30, color: '#e9ac64', message: 'Parabéns! Você ganhou um adesivo! ⭐' },
  { id: 'semente', label: 'Semente', icon: '🌱', weight: 20, color: '#a7c6a1', message: 'Parabéns! Você ganhou uma semente! 🌱' },
  { id: 'tente', label: 'Tente outra vez', icon: '🔄', weight: 20, color: '#ead4c2', message: 'Não foi dessa vez! Tente outra vez! 🔄' },
  { id: 'marca', label: 'Marca-página', icon: '📖', weight: 20, color: '#e2aa87', message: 'Parabéns! Você ganhou um marca-página! 📖' },
]

export function validatePrizes(items: readonly Prize[]): void {
  if (items.length !== 5 || items.some(item => !Number.isInteger(item.weight) || item.weight <= 0) || items.reduce((sum, item) => sum + item.weight, 0) !== 100 || new Set(items.map(item => item.id)).size !== items.length) {
    throw new Error('Configure cinco prêmios únicos, com pesos positivos cuja soma seja 100%.')
  }
}
validatePrizes(prizes)
export const sectorSweep = 360 / prizes.length

/** A 32-bit integer avoids floating point rounding at interval boundaries. */
export function drawPrize(random: () => number = cryptoRandom): Prize {
  const value = random()
  if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Valor aleatório inválido.')
  const slot = Math.floor(value * 100)
  let threshold = 0
  for (const prize of prizes) {
    threshold += prize.weight
    if (slot < threshold) return prize
  }
  return prizes[prizes.length - 1]
}

function cryptoRandom(): number {
  const buffer = new Uint32Array(1)
  crypto.getRandomValues(buffer)
  return buffer[0] / 0x100000000
}

export function sectorCenter(id: PrizeId): number {
  const index = prizes.findIndex(prize => prize.id === id)
  if (index < 0) throw new Error('Prêmio desconhecido.')
  return (index + 0.5) * sectorSweep
}
