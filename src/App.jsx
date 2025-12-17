import { useState, useEffect } from 'react'
import './App.css'

// СЛОВАРЬ
const t = {
  ru: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купил', sell: 'Продал', profit: 'Прибыль', sets: 'Настройки', close: 'Закрыть' },
  en: { calc: 'Calculator', flip: 'Flip NFT', buy: 'Buy Price', sell: 'Sell Price', profit: 'Profit', sets: 'Settings', close: 'Close' },
  ua: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купив', sell: 'Продав', profit: 'Прибуток', sets: 'Налаштування', close: 'Закрити' }
}

function App() {
  const [mode, setMode] = useState('calc') 
  const [lang, setLang] = useState('ru')
  const [showSettings, setShowSettings] = useState(false)
  const [tonPrice, setTonPrice] = useState(null)

  // Flip States
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')

  // Calc States
  const [display, setDisplay] = useState('0')
  const [waiting, setWaiting] = useState(false)
  const [op, setOp] = useState(null)
  const [memory, setMemory] = useState(null)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
      // Авто-определение языка
      const userLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
      if (userLang === 'uk') setLang('ua');
      else if (userLang === 'en') setLang('en');
    }
    
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.20'));
  }, [])

  // CALC LOGIC
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
  const calc = (a,b,o) => { if(o==='/')return a/b; if(o==='x')return a*b; if(o==='-')return a-b; if(o==='+')return a+b; return b; }
  const reset = () => { setDisplay('0'); setMemory(null); setOp(null); setWaiting(false); }
  const invert = () => setDisplay(String(parseFloat(display)*-1));
  const percent = () => setDisplay(String(parseFloat(display)/100));

  // FLIP LOGIC (10% Fee default)
  const getProfit = () => {
    const b = parseFloat(buy); const s = parseFloat(sell);
    if (!b || !s) return null;
    return (s * 0.90 - b).toFixed(2);
  }
  const profit = getProfit();

  return (
    <>
      <div className="bg-glow"></div>

      <div className="island">
        
        {/* HEADER */}
        <div className="header">
          <div className="title">TON Tools 💎 ${tonPrice || '...'}</div>
          <div className="settings-btn" onClick={()=>setShowSettings(true)}>⚙️</div>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button className={`tab ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>{t[lang].calc}</button>
          <button className={`tab ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>{t[lang].flip}</button>
        </div>

        {/* SETTINGS MODAL */}
        {showSettings && (
          <div className="modal-overlay">
            <h3 style={{marginBottom:'20px'}}>{t[lang].sets}</h3>
            <button className={`lang-btn ${lang==='ru'?'active':''}`} onClick={()=>setLang('ru')}>Русский 🇷🇺</button>
            <button className={`lang-btn ${lang==='en'?'active':''}`} onClick={()=>setLang('en')}>English 🇺🇸</button>
            <button className={`lang-btn ${lang==='ua'?'active':''}`} onClick={()=>setLang('ua')}>Українська 🇺🇦</button>
            <button className="lang-btn" style={{marginTop:'20px', borderColor:'#ff4d4d'}} onClick={()=>setShowSettings(false)}>{t[lang].close}</button>
          </div>
        )}

        {/* CALC MODE */}
        {mode === 'calc' && (
          <div style={{width:'100%'}}>
            <div className="calc-screen">{display}</div>
            <div className="calc-grid">
              <button className="btn" onClick={reset} style={{color:'#ff4d4d'}}>AC</button>
              <button className="btn" onClick={invert}>+/-</button>
              <button className="btn" onClick={percent}>%</button>
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

        {/* FLIP MODE */}
        {mode === 'flip' && (
          <div style={{width:'100%'}}>
            <div className="label">{t[lang].buy}</div>
            <input type="number" className="input" placeholder="0" value={buy} onChange={e=>setBuy(e.target.value)} />
            
            <div className="label">{t[lang].sell}</div>
            <input type="number" className="input" placeholder="0" value={sell} onChange={e=>setSell(e.target.value)} />

            {profit !== null && (
              <div className="result">
                <div style={{fontSize:'12px', color:'#aaa'}}>{t[lang].profit}</div>
                <div className="res-val">{parseFloat(profit)>0?'+':''}{profit} TON</div>
                {tonPrice && <div style={{fontSize:'12px', color:'#888', marginTop:'5px'}}>≈ ${(parseFloat(profit)*tonPrice).toFixed(2)}</div>}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  )
}

export default App