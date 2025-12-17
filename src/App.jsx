import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [mode, setMode] = useState('calc') 
  const [tonPrice, setTonPrice] = useState(null)

  // Calc Logic
  const [display, setDisplay] = useState('0')
  const [waiting, setWaiting] = useState(false)
  const [op, setOp] = useState(null)
  const [memory, setMemory] = useState(null)

  // Flip Logic
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')
  const [feeType, setFeeType] = useState('std') // 'std' (10%) or 'custom'
  const [customFee, setCustomFee] = useState('')

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
    }
    // Binance API
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.50'));
  }, [])

  // --- CALC LOGIC ---
  const num = (n) => {
    if (waiting) { setDisplay(String(n)); setWaiting(false); }
    else setDisplay(display === '0' ? String(n) : display + String(n));
  }
  const operator = (o) => {
    const val = parseFloat(display);
    if (memory === null) setMemory(val);
    else if (op) {
      const res = calc(memory, val, op);
      setDisplay(String(res).slice(0, 10)); setMemory(res);
    }
    setWaiting(true); setOp(o);
  }
  const calc = (a,b,o) => { if(o==='/')return a/b; if(o==='x')return a*b; if(o==='-')return a-b; if(o==='+')return a+b; return b; }
  const reset = () => { setDisplay('0'); setMemory(null); setOp(null); setWaiting(false); }
  const invert = () => setDisplay(String(parseFloat(display)*-1));
  const percent = () => setDisplay(String(parseFloat(display)/100));

  // --- FLIP LOGIC ---
  const getProfit = () => {
    const b = parseFloat(buy); const s = parseFloat(sell);
    if (!b || !s) return null;
    
    // Если стандарт - 10% (5% маркет + 5% роялти). Если кастом - берем ввод
    const feePercent = feeType === 'std' ? 10 : (parseFloat(customFee) || 0);
    
    const profitVal = s * (1 - feePercent/100) - b;
    return profitVal.toFixed(2);
  }
  const profit = getProfit();

  return (
    <>
      <div className="bg-space"></div>

      <div className="main-card">
        
        {/* HEADER */}
        <div className="header">
          <div style={{fontWeight:'800', fontSize:'16px'}}>TON Calc ⚡️</div>
          <div className="price-pill">💎 ${tonPrice || '...'}</div>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button className={`tab ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>Калькулятор</button>
          <button className={`tab ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>Flip NFT</button>
        </div>

        {/* --- CALC MODE --- */}
        {mode === 'calc' && (
          <div style={{animation:'popIn 0.3s'}}>
            <div className="screen">{display}</div>
            <div className="keypad">
              <button className="btn" onClick={reset} style={{color:'#ff4d4d'}}>AC</button>
              <button className="btn" onClick={invert}>+/-</button>
              <button className="btn" onClick={percent}>%</button>
              <button className="btn op" onClick={()=>operator('/')}>÷</button>
              
              <button className="btn" onClick={()=>num(7)}>7</button>
              <button className="btn" onClick={()=>num(8)}>8</button>
              <button className="btn" onClick={()=>num(9)}>9</button>
              <button className="btn op" onClick={()=>operator('x')}>×</button>
              
              <button className="btn" onClick={()=>num(4)}>4</button>
              <button className="btn" onClick={()=>num(5)}>5</button>
              <button className="btn" onClick={()=>num(6)}>6</button>
              <button className="btn op" onClick={()=>operator('-')}>−</button>
              
              <button className="btn" onClick={()=>num(1)}>1</button>
              <button className="btn" onClick={()=>num(2)}>2</button>
              <button className="btn" onClick={()=>num(3)}>3</button>
              <button className="btn op" onClick={()=>operator('+')}>+</button>
              
              <button className="btn zero" onClick={()=>num(0)}>0</button>
              <button className="btn" onClick={()=>{if(!display.includes('.'))setDisplay(display+'.')}}>.</button>
              <button className="btn eq" onClick={()=>operator('=')}>=</button>
            </div>
          </div>
        )}

        {/* --- FLIP MODE --- */}
        {mode === 'flip' && (
          <div style={{animation:'popIn 0.3s'}}>
            <div className="label">Купил (TON)</div>
            <input type="number" className="input" placeholder="0" value={buy} onChange={e=>setBuy(e.target.value)} />
            
            <div className="label">Продал (TON)</div>
            <input type="number" className="input" placeholder="0" value={sell} onChange={e=>setSell(e.target.value)} />

            <div className="label">Комиссия</div>
            <div className="fees">
              <div className={`fee-chip ${feeType==='std'?'active':''}`} onClick={()=>setFeeType('std')}>
                Getgems (10%)
              </div>
              <div className={`fee-chip ${feeType==='custom'?'active':''}`} onClick={()=>setFeeType('custom')}>
                Своя (%)
              </div>
            </div>

            {feeType === 'custom' && (
               <input type="number" className="input" placeholder="Например: 5" value={customFee} onChange={e=>setCustomFee(e.target.value)} style={{marginTop:'-5px'}} />
            )}

            {profit !== null && (
              <div className="result-card">
                <div style={{fontSize:'12px', color:'#aaa'}}>Чистый профит</div>
                <div className="res-val">{parseFloat(profit)>0?'+':''}{profit} TON</div>
                {tonPrice && <div className="res-sub">≈ ${(parseFloat(profit)*tonPrice).toFixed(2)}</div>}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  )
}

export default App