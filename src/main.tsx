import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, ArrowRight, BarChart3, Gift, RotateCcw, Trash2, X } from 'lucide-react'
import { drawPrize, prizes, sectorCenter, type Prize, type PrizeId } from './prizes'
import './style.css'

type Play = { id: string; prizeId: PrizeId; at: string }
const storageKey = 'roleta-bet-plays-v1'
function readPlays(): Play[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]')
    return Array.isArray(value) ? value.filter((p): p is Play => !!p && typeof p.id === 'string' && typeof p.at === 'string' && prizes.some(prize => prize.id === p.prizeId)) : []
  } catch { return [] }
}

function point(degrees: number, radius: number) {
  const radians = (degrees - 90) * Math.PI / 180
  return { x: 200 + radius * Math.cos(radians), y: 200 + radius * Math.sin(radians) }
}
function slice(start: number, end: number) {
  const a = point(start, 184), b = point(end, 184)
  return `M 200 200 L ${a.x} ${a.y} A 184 184 0 ${end - start > 180 ? 1 : 0} 1 ${b.x} ${b.y} Z`
}

function Wheel({ rotation, spinning }: { rotation: number; spinning: boolean }) {
  let angle = 0
  return <div className="wheel-assembly">
    <div className="pointer" aria-hidden="true" />
    <div className="wheel-frame">
      <svg className="wheel" viewBox="0 0 400 400" role="img" aria-label="Roleta com cinco setores proporcionais às probabilidades" style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 5s cubic-bezier(.11,.72,.12,1)' : 'none' }}>
        <circle cx="200" cy="200" r="198" fill="#fff7e7" />
        {prizes.map(prize => {
          const start = angle; const end = angle += prize.weight * 3.6
          const center = (start + end) / 2
          const position = point(center, prize.weight === 10 ? 125 : 117)
          return <g key={prize.id}>
            <path d={slice(start, end)} fill={prize.color} stroke="#fff8e9" strokeWidth="3" />
            <text x={position.x} y={position.y - 8} textAnchor="middle" dominantBaseline="middle" className="wheel-emoji">{prize.icon}</text>
            <text x={position.x} y={position.y + 20} textAnchor="middle" dominantBaseline="middle" className="wheel-label">{prize.label === 'Tente outra vez' ? 'Tente de novo' : prize.label}</text>
          </g>
        })}
        <circle cx="200" cy="200" r="40" fill="#fff9ed" stroke="#e9dbc0" strokeWidth="5" />
        <text x="200" y="202" textAnchor="middle" dominantBaseline="middle" fontSize="31">✦</text>
      </svg>
    </div>
  </div>
}

function App() {
  const [page, setPage] = useState<'game' | 'admin'>('game')
  const [plays, setPlays] = useState<Play[]>(readPlays)
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<Prize | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const busy = useRef(false)
  const rotationRef = useRef(0)
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(plays)) } catch { /* Private mode may disable storage. */ } }, [plays])
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function spin() {
    if (busy.current) return
    busy.current = true
    const prize = drawPrize()
    const current = ((rotationRef.current % 360) + 360) % 360
    const destination = (360 - sectorCenter(prize.id)) % 360
    const delta = (destination - current + 360) % 360
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const next = rotationRef.current + (reduced ? 0 : 6 * 360) + delta
    rotationRef.current = next
    setResult(null)
    setSpinning(!reduced)
    setRotation(next)
    timer.current = setTimeout(() => {
      const play = { id: crypto.randomUUID(), prizeId: prize.id, at: new Date().toISOString() }
      setPlays(previous => [play, ...previous])
      setSpinning(false)
      setResult(prize)
      busy.current = false
    }, reduced ? 80 : 5000)
  }
  const total = plays.length
  return <div className="app-shell">
    <header className="topbar"><button className="brand" onClick={() => setPage('game')} aria-label="Ir para a roleta"><span className="brand-mark">✳</span><span>roleta<span className="brand-accent">.</span>brindes</span></button><button className="nav-link" onClick={() => setPage(page === 'game' ? 'admin' : 'game')}>{page === 'game' ? <><BarChart3 size={17}/> Painel administrativo</> : <><ArrowLeft size={17}/> Voltar à roleta</>}</button></header>
    {page === 'game' ? <main className="game-layout">
      <section className="intro"><div className="eyebrow"><span className="eyebrow-dot"/> SUA CHANCE DE GANHAR</div><h1>Gire a sorte.<br/><em>Ganhe um sorriso.</em></h1><p>Um giro, cinco possibilidades. Toque no botão e descubra qual surpresa espera por você!</p><div className="prize-guide"><span className="guide-title">PRÊMIOS DA ROLETA</span>{prizes.map(prize => <div className="guide-row" key={prize.id}><span className="guide-icon" style={{ backgroundColor: prize.color }}>{prize.icon}</span><span>{prize.label}</span><span className="guide-weight">{prize.weight}%</span></div>)}</div></section>
      <section className="stage" aria-label="Jogo da roleta"><div className="stage-sparkle one">✦</div><div className="stage-sparkle two">✳</div><div className="stage-sparkle three">✦</div><Wheel rotation={rotation} spinning={spinning}/><button className="spin-button" onClick={spin} disabled={spinning}><RotateCcw size={20} className={spinning ? 'spin-icon' : ''}/>{spinning ? 'GIRANDO...' : 'GIRAR ROLETA'}<ArrowRight size={20}/></button><p className="stage-hint">{spinning ? 'A sorte está a caminho...' : 'Aperte o botão para começar ✨'}</p></section>
    </main> : <main className="admin-layout"><div className="admin-heading"><div><div className="eyebrow"><span className="eyebrow-dot"/> VISÃO GERAL</div><h1>Painel <em>administrativo</em></h1><p>Acompanhe os resultados registrados neste dispositivo.</p></div><button className="outline-button" onClick={() => setConfirmClear(true)} disabled={!total}><Trash2 size={16}/> Limpar histórico</button></div><div className="total-card"><span>Total de giros</span><strong>{total}</strong><span>jogadas registradas</span></div><div className="stats-grid">{prizes.map(prize => { const count = plays.filter(play => play.prizeId === prize.id).length; return <div className="stat-card" key={prize.id}><span className="stat-icon" style={{ backgroundColor: prize.color }}>{prize.icon}</span><span>{prize.label}</span><strong>{count}</strong><div className="stat-bar"><div style={{ width: `${total ? count / total * 100 : 0}%`, backgroundColor: prize.color }}/></div><small>{total ? (count / total * 100).toFixed(1) : '0,0'}% observado · {prize.weight}% esperado</small></div> })}</div><section className="history"><h2>Últimas jogadas</h2>{total ? <div className="history-list">{plays.slice(0, 20).map(play => { const prize = prizes.find(item => item.id === play.prizeId)!; return <div className="history-item" key={play.id}><span className="history-icon" style={{ backgroundColor: prize.color }}>{prize.icon}</span><span>{prize.label}</span><time dateTime={play.at}>{new Date(play.at).toLocaleString('pt-BR')}</time></div> })}</div> : <p className="empty">Nenhuma jogada registrada ainda.</p>}</section></main>}
    <footer>Feito para espalhar boas surpresas <span>✳</span></footer>
    {result && <div className="modal-backdrop" onClick={() => setResult(null)}><div className="result-modal" role="dialog" aria-modal="true" aria-labelledby="result-title" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setResult(null)} aria-label="Fechar"><X size={20}/></button>{result.id !== 'tente' && <div className="confetti" aria-hidden="true">✦ ✳ ✦ ✳ ✦</div>}<div className="result-icon" style={{ backgroundColor: result.color }}>{result.icon}</div><div className="eyebrow">{result.id === 'tente' ? 'MAIS UMA CHANCE' : 'TEMOS UM VENCEDOR!'}</div><h2 id="result-title">{result.id === 'tente' ? 'Quase lá!' : 'Que sorte a sua!'}</h2><p>{result.message}</p><button className="spin-button modal-button" onClick={() => { setResult(null); spin() }}><RotateCcw size={19}/> JOGAR NOVAMENTE <ArrowRight size={19}/></button></div></div>}
    {confirmClear && <div className="modal-backdrop" onClick={() => setConfirmClear(false)}><div className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={event => event.stopPropagation()}><Gift size={30}/><h2 id="confirm-title">Limpar histórico?</h2><p>Todos os resultados salvos neste navegador serão removidos.</p><div className="confirm-actions"><button className="outline-button" onClick={() => setConfirmClear(false)}>Cancelar</button><button className="danger-button" onClick={() => { setPlays([]); setConfirmClear(false) }}>Sim, limpar</button></div></div></div>}
  </div>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>)
