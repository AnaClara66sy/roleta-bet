import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { drawPrize, prizes, sectorCenter, sectorSweep, type Prize } from './prizes'
import './style.css'

function point(degrees: number, radius: number) {
  const radians = (degrees - 90) * Math.PI / 180
  return { x: 200 + radius * Math.cos(radians), y: 200 + radius * Math.sin(radians) }
}
function slice(start: number, end: number) {
  const a = point(start, 186), b = point(end, 186)
  return `M 200 200 L ${a.x} ${a.y} A 186 186 0 ${end - start > 180 ? 1 : 0} 1 ${b.x} ${b.y} Z`
}
function Wheel({ rotation, spinning, onSpin }: { rotation: number; spinning: boolean; onSpin: () => void }) {
  let angle = 0
  return <div className="wheel-wrap"><div className="wheel-pointer" aria-hidden="true"/><div className="wheel-rim"><svg className="wheel" viewBox="0 0 400 400" role="img" aria-label="Roleta de brindes" style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 5s cubic-bezier(.10,.73,.13,1)' : 'none' }}>
    {prizes.map(prize => {
      const start = angle, end = angle += sectorSweep
      const position = point((start + end) / 2, 122)
      return <g key={prize.id}><path d={slice(start, end)} fill={prize.color} stroke="#fcebdd" strokeWidth="4"/><text x={position.x} y={position.y - 12} textAnchor="middle" dominantBaseline="middle" className="wheel-emoji">{prize.icon}</text><text x={position.x} y={position.y + 17} textAnchor="middle" dominantBaseline="middle" className="wheel-label">{prize.id === 'tente' ? 'Tente de novo' : prize.label}</text></g>
    })}
  </svg></div><button className="wheel-center" onClick={onSpin} disabled={spinning} aria-label="Girar roleta"><span>GIRAR</span><small>✦</small></button></div>
}
function App() {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<Prize | null>(null)
  const busy = useRef(false)
  const rotationRef = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])
  function spin() {
    if (busy.current || result) return
    busy.current = true
    const prize = drawPrize()
    const current = ((rotationRef.current % 360) + 360) % 360
    const destination = (360 - sectorCenter(prize.id)) % 360
    const delta = (destination - current + 360) % 360
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const next = rotationRef.current + (reducedMotion ? 0 : 6 * 360) + delta
    rotationRef.current = next
    setSpinning(!reducedMotion)
    setRotation(next)
    timer.current = setTimeout(() => { setSpinning(false); setResult(prize); busy.current = false }, reducedMotion ? 80 : 5000)
  }
  return <main className="page"><div className="background-lines left" aria-hidden="true"/><div className="background-lines right" aria-hidden="true"/>
    <header className="page-header"><h1>Roleta Mottainai</h1></header>
    <section className="game" aria-label="Roleta Mottainai"><Wheel rotation={rotation} spinning={spinning} onSpin={spin}/></section>
    <footer className="tab-bar"><button className="spin-button" onClick={spin} disabled={spinning}>{spinning ? 'GIRANDO...' : 'GIRAR ROLETA'} <span aria-hidden="true">↗</span></button><span className="tab-hint">{spinning ? 'A sorte está a caminho…' : 'Boa sorte! ✦'}</span></footer>
    {result && <div className="result-screen" role="button" tabIndex={0} aria-label={`${result.message} Toque para voltar à roleta.`} onClick={() => setResult(null)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setResult(null) }}><div className="result-burst" aria-hidden="true">✦</div><span className="result-eyebrow">{result.id === 'tente' ? 'MAIS UMA CHANCE' : 'VOCÊ GANHOU!'}</span><div className="result-prize" style={{ borderColor: result.color }}>{result.icon}</div><h2>{result.id === 'tente' ? 'Quase lá!' : result.label}</h2><p>{result.message}</p><span className="result-return">Toque em qualquer lugar para voltar à roleta <span aria-hidden="true">↗</span></span></div>}
  </main>
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
