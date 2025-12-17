import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [mode, setMode] = useState('calc') 
  
  // MODALS
  const [showGuide, setShowGuide] = useState(false)
  const [showInfo, setShowInfo] = useState(false) // Объяснение для Flip

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
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
    }
    
    // Показываем гайд только 1 раз
    if (!localStorage.getItem('v8_guide_seen')) {
      setShowGuide(true);
    }

    // Курс
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.20'));
  }, [])

  // --- LOGIC ---
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
  const calc = (a, b, o) => {
    if(o==='/')return a/b; if(o==='x')return a*b; if(o==='-')return a-b; if(o==='+')return a+b; return b;
  }
  const reset = () => { setDisplay('0'); setMemory(null); setOp(null); setWaiting(false); }
  
  const getProfit = () => {
    const b = parseFloat(buy); const s = parseFloat(sell);
    if (!b || !s) return null;
    return (s * 0.90 - b).toFixed(2); // 10% комиссия
  }
  const profit = getProfit();

  // --- HANDLERS ---
  const closeGuide = () => {
    localStorage.setItem('v8_guide_seen', 'true');
    setShowGuide(false);
  }

  return (
    <>
      <div className="bg-fx"></div>

      {/* --- ГАЙД (ONBOARDING) --- */}
      {showGuide && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">👋</div>
            <div className="modal-h">Добро пожаловать</div>
            <div className="modal-p">
              Это <b>TON Calculator</b>.<br/><br/>
              Здесь ты можешь мгновенно считать прибыль с NFT и пользоваться удобным калькулятором.
            </div>
            <button className="modal-btn" onClick={closeGuide}>Начать</button>
          </div>
        </div>
      )}

      {/* --- INFO MODAL (FLIP EXPLAIN) --- */}
      {showInfo && (
        <div className="modal-overlay" onClick={()=>setShowInfo(false)}>
          <div className="modal-card" onClick={e=>e.stopPropagation()}>
            <div className="modal-icon">💡</div>
            <div className="modal-h">Как считаем?</div>
            <div className="modal-p" style={{textAlign:'left'}}>
              Мы берем цену продажи и вычитаем:<br/><br/>
              <b>5%</b> — комиссия маркетплейса (Getgems)<br/>
              <b>5%</b> — роялти автора (стандарт)<br/><br/>
              Итого вы получаете <b>90%</b> от суммы продажи.
            </div>
            <button className="modal-btn" onClick={()=>setShowInfo(false)}>Понятно</button>
          </div>
        </div>
      )}


      {/* --- ГЛАВНЫЙ ЭКРАН --- */ }
      <div className="mobile-wrapper">
        
        {/* HEADER */}
        <div className="header">
          <div className="price-pill">💎 ${tonPrice || '...'}</div>
          {mode === 'flip' && <button className="help-btn" onClick={()=>setShowInfo(true)}>❓</button>}
        </div>

        {/* TABS */}
        <div className="tabs-glass">
          <button className={`tab ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>Калькулятор</button>
          <button className={`tab ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>Flip NFT</button>
        </div>

        {/* CONTENT */}
        {mode === 'calc' && (
          <div className="calc-container">
            <div className="screen">{display}</div>
            <div className="keypad">
              <button className="btn gray" onClick={reset}>AC</button>
              <button className="btn gray" onClick={()=>setDisplay(String(parseFloat(display)*-1))}>+/-</button>
              <button className="btn gray" onClick={()=>setDisplay(String(parseFloat(display)/100))}>%</button>
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
              <button className="btn" onClick={()=>{if(!display.includes('.'))setDisplay(display+'.')}}>,</button>
              <button className="btn neon" onClick={()=>operator('=')}>=</button>
            </div>
          </div>
        )}

        {mode === 'flip' && (
          <div className="flip-card">
             <div className="input-label">Купил за (TON)</div>
             <input type="number" className="glass-input" placeholder="0" value={buy} onChange={e=>setBuy(e.target.value)} />
             
             <div className="input-label" style={{marginTop:'20px'}}>Продал за (TON)</div>
             <input type="number" className="glass-input" placeholder="0" value={sell} onChange={e=>setSell(e.target.value)} />

             {profit !== null && (
               <div className="result-area">
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