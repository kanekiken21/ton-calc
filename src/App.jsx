import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('calc') 
  const [tonPrice, setTonPrice] = useState(null)

  // Flip State
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')
  const [feeMode, setFeeMode] = useState('getgems') // 'getgems' | 'custom'
  const [customFee, setCustomFee] = useState('')
  
  // Calc State
  const [display, setDisplay] = useState('0')
  const [waiting, setWaiting] = useState(false)
  const [op, setOp] = useState(null)
  const [memory, setMemory] = useState(null)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
    }
    setTimeout(() => setLoading(false), 2000);
    
    // Курс
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.20'));
  }, [])

  // --- FLIP LOGIC ---
  const getProfit = () => {
    const b = parseFloat(buy);
    const s = parseFloat(sell);
    if (!b || !s) return null;

    let totalFeePercent = 0;

    if (feeMode === 'getgems') {
      // 5% Market + 5% Royalty = 10%
      totalFeePercent = 10;
    } else {
      // Пользователь вводит сам (например, 0 или 2.5)
      totalFeePercent = customFee ? parseFloat(customFee) : 0;
    }

    const feeAmount = s * (totalFeePercent / 100);
    return (s - feeAmount - b).toFixed(2);
  }
  const profit = getProfit();

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
      setDisplay(String(res).slice(0, 9)); setMemory(res);
    }
    setWaiting(true); setOp(o);
  }
  const calc = (a,b,o) => {
    if(o==='/')return a/b; if(o==='x')return a*b; if(o==='-')return a-b; if(o==='+')return a+b; return b;
  }
  const reset = () => { setDisplay('0'); setMemory(null); setOp(null); setWaiting(false); }
  const percent = () => setDisplay(String(parseFloat(display)/100));
  const invert = () => setDisplay(String(parseFloat(display)*-1));

  return (
    <>
      {loading && (
        <div className="splash">
          <div className="splash-logo">💎</div>
          <div className="splash-text">my TON Calculator</div>
        </div>
      )}

      {/* HEADER */}
      <div className="header">
        <div className="pill">💎 TON ${tonPrice || '...'}</div>
      </div>

      {/* TABS */}
      <div className="nav-container">
        <div className="segmented">
          <button className={`seg-btn ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>Калькулятор</button>
          <button className={`seg-btn ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>Flip NFT</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="view">
        
        {/* --- CALC MODE --- */}
        {mode === 'calc' && (
          <div className="fade-in" style={{width:'100%'}}>
            <div className="calc-screen">{display}</div>
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
              <button className="btn blue" onClick={()=>operator('=')}>=</button>
            </div>
          </div>
        )}

        {/* --- FLIP MODE --- */}
        {mode === 'flip' && (
          <div className="glass-card fade-in">
            <div className="row">
              <div className="col">
                <div className="label">Купил</div>
                <input type="number" className="input" placeholder="0" value={buy} onChange={e=>setBuy(e.target.value)}/>
              </div>
              <div className="col">
                <div className="label">Продал</div>
                <input type="number" className="input" placeholder="0" value={sell} onChange={e=>setSell(e.target.value)}/>
              </div>
            </div>

            <div className="label" style={{marginBottom:'10px'}}>Где продаем?</div>
            <div className="fee-toggle">
              <button className={`fee-btn ${feeMode==='getgems'?'active':''}`} onClick={()=>setFeeMode('getgems')}>
                Getgems (10%)
              </button>
              <button className={`fee-btn ${feeMode==='custom'?'active':''}`} onClick={()=>setFeeMode('custom')}>
                Свой %
              </button>
            </div>

            {feeMode === 'custom' && (
               <div style={{marginBottom:'15px', animation:'fadeIn 0.2s'}}>
                 <div className="label">Общая комиссия (%)</div>
                 <input type="number" className="input" placeholder="0" value={customFee} onChange={e=>setCustomFee(e.target.value)}/>
               </div>
            )}

            {profit !== null && (
              <div className="result">
                <div style={{fontSize:'12px', color:'#888'}}>Чистая прибыль</div>
                <div className="res-main">{parseFloat(profit)>0?'+':''}{profit} TON</div>
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