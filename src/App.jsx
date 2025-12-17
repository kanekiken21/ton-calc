import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [mode, setMode] = useState('calc') 
  const [showGuide, setShowGuide] = useState(false)
  const [tonPrice, setTonPrice] = useState(null)

  // Calc Logic
  const [display, setDisplay] = useState('0')
  const [waiting, setWaiting] = useState(false)
  const [op, setOp] = useState(null)
  const [memory, setMemory] = useState(null)

  // Flip Logic
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')

  useEffect(() => {
    // Telegram
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
    }
    // Check Guide
    if (!localStorage.getItem('v7_visited')) setShowGuide(true);
    // Fetch Price
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.25'));
  }, [])

  // --- CALC LOGIC ---
  const num = (n) => {
    if (waiting) {
      setDisplay(String(n));
      setWaiting(false);
    } else {
      setDisplay(display === '0' ? String(n) : display + String(n));
    }
  }

  const operator = (nextOp) => {
    const val = parseFloat(display);
    if (memory === null) setMemory(val);
    else if (op) {
      const res = calculate(memory, val, op);
      setDisplay(String(res).slice(0, 9));
      setMemory(res);
    }
    setWaiting(true);
    setOp(nextOp);
  }

  const calculate = (a, b, o) => {
    if (o==='/') return a/b; if (o==='x') return a*b;
    if (o==='-') return a-b; if (o==='+') return a+b; return b;
  }

  const reset = () => { setDisplay('0'); setMemory(null); setOp(null); setWaiting(false); }
  const invert = () => setDisplay(String(parseFloat(display)*-1));
  const percent = () => setDisplay(String(parseFloat(display)/100));

  // --- FLIP LOGIC ---
  const getProfit = () => {
    const b = parseFloat(buy); const s = parseFloat(sell);
    if (!b || !s) return null;
    // 5% маркет + 5% роялти = 10%
    return (s * 0.90 - b).toFixed(2);
  }
  const profit = getProfit();

  return (
    <>
      {/* GUIDE */}
      {showGuide && (
        <div className="guide-overlay">
          <div className="guide-card">
            <div className="guide-icon">👋</div>
            <h3>Добро пожаловать</h3>
            <p style={{color:'#888', marginBottom:'20px'}}>
              <b>Calc</b> — неоновый калькулятор.<br/>
              <b>Flip</b> — считай чистый профит.
            </p>
            <button className="guide-btn" onClick={()=>{
              localStorage.setItem('v7_visited','true'); setShowGuide(false)
            }}>Погнали!</button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="header">
        <div className="price-tag">💎 TON ${tonPrice || '...'}</div>
        <div className="tabs">
          <button className={`tab ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>Calc</button>
          <button className={`tab ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>Flip</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="screen">
        
        {/* MODE: CALC */}
        {mode === 'calc' && (
          <div style={{width:'100%', animation:'fadeIn 0.3s'}}>
            <div className="calc-display">{display}</div>
            <div className="calc-grid">
              <button className="btn gray" onClick={reset}>AC</button>
              <button className="btn gray" onClick={invert}>+/-</button>
              <button className="btn gray" onClick={percent}>%</button>
              <button className="btn blue" onClick={()=>operator('/')}>÷</button>
              
              <button className="btn" onClick={()=>num(7)}>7</button>
              <button className="btn" onClick={()=>num(8)}>8</button>
              <button className="btn" onClick={()=>num(9)}>9</button>
              <button className="btn blue" onClick={()=>operator('x')}>×</button>
              
              <button className="btn" onClick={()=>num(4)}>4</button>
              <button className="btn" onClick={()=>num(5)}>5</button>
              <button className="btn" onClick={()=>num(6)}>6</button>
              <button className="btn blue" onClick={()=>operator('-')}>−</button>
              
              <button className="btn" onClick={()=>num(1)}>1</button>
              <button className="btn" onClick={()=>num(2)}>2</button>
              <button className="btn" onClick={()=>num(3)}>3</button>
              <button className="btn blue" onClick={()=>operator('+')}>+</button>
              
              <button className="btn zero" onClick={()=>num(0)}>0</button>
              <button className="btn" onClick={()=>{if(!display.includes('.'))setDisplay(display+'.')}}>.</button>
              <button className="btn neon" onClick={()=>operator('=')}>=</button>
            </div>
          </div>
        )}

        {/* MODE: FLIP */}
        {mode === 'flip' && (
          <div className="flip-card">
            <div className="label">Купил (TON)</div>
            <input type="number" className="input" placeholder="0" value={buy} onChange={e=>setBuy(e.target.value)} />
            
            <div className="label">Продал (TON)</div>
            <input type="number" className="input" placeholder="0" value={sell} onChange={e=>setSell(e.target.value)} />

            {profit !== null && (
              <div className="profit-box">
                <div style={{fontSize:'12px', color:'#888'}}>Чистая прибыль</div>
                <div className="val">{parseFloat(profit)>0?'+':''}{profit} TON</div>
                {tonPrice && <div className="sub">≈ ${(parseFloat(profit)*tonPrice).toFixed(2)}</div>}
                
                <div style={{fontSize:'10px', color:'#555', marginTop:'15px', background:'rgba(0,0,0,0.2)', padding:'10px', borderRadius:'10px'}}>
                  ℹ️ Формула: Продажа - 10% (5% Getgems + 5% Автор) - Покупка
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </>
  )
}

export default App