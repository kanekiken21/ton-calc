import { useState, useEffect } from 'react'
import './App.css'

// СЛОВАРЬ
const t = {
  ru: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купил', sell: 'Продал', profit: 'Прибыль', sets: 'Настройки', close: 'Закрыть', custom: 'Своя (%)' },
  en: { calc: 'Calculator', flip: 'Flip NFT', buy: 'Buy Price', sell: 'Sell Price', profit: 'Profit', sets: 'Settings', close: 'Close', custom: 'Custom (%)' },
  ua: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купив', sell: 'Продав', profit: 'Прибуток', sets: 'Налаштування', close: 'Закрити', custom: 'Своя (%)' }
}

function App() {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('calc') 
  const [lang, setLang] = useState('ru')
  const [showSettings, setShowSettings] = useState(false)
  const [tonPrice, setTonPrice] = useState(null)

  // Flip States
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')
  const [feeType, setFeeType] = useState('std') 
  const [customFee, setCustomFee] = useState('')

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
      const userLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
      if (userLang === 'uk') setLang('ua');
      if (userLang === 'en') setLang('en');
    }
    setTimeout(() => setLoading(false), 2500);
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

  // FLIP LOGIC
  const getProfit = () => {
    const b = parseFloat(buy); const s = parseFloat(sell);
    if (!b || !s) return null;
    const fee = feeType === 'std' ? 10 : (parseFloat(customFee) || 0);
    return (s * (1 - fee/100) - b).toFixed(2);
  }
  const profit = getProfit();

  return (
    <>
      <div className="bg-fx"></div>

      {/* SPLASH SCREEN С НОВЫМ ЛОГОТИПОМ */}
      {loading && (
        <div className="splash">
          {/* ВСТРОЕННЫЙ SVG ЛОГОТИП */}
          <svg className="splash-logo" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 0L186.603 50V150L100 200L13.3975 150V50L100 0Z" fill="url(#paint0_linear)"/>
            <path d="M100 200L13.3975 150L100 100L186.603 150L100 200Z" fill="url(#paint1_linear)"/>
            <defs>
              <linearGradient id="paint0_linear" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007AFF"/>
                <stop offset="1" stopColor="#00F0FF"/>
              </linearGradient>
              <linearGradient id="paint1_linear" x1="100" y1="100" x2="100" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00F0FF"/>
                <stop offset="1" stopColor="#007AFF"/>
              </linearGradient>
            </defs>
          </svg>
          <div className="splash-text">my TON Calculator</div>
        </div>
      )}

      <div className="island">
        
        {/* HEADER */}
        <div className="header">
          <div className="title">TON Tools 💎 ${tonPrice || '...'}</div>
          <div className="settings-icon" onClick={()=>setShowSettings(true)}>⚙️</div>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button className={`tab ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>{t[lang].calc}</button>
          <button className={`tab ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>{t[lang].flip}</button>
        </div>

        {/* SETTINGS */}
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
          <div style={{width:'100%', animation:'fadeIn 0.3s'}}>
            <div className="calc-screen">{display}</div>
            <div className="keypad">
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
          <div className="flip-cont">
            <div className="label">{t[lang].buy}</div>
            <input type="number" className="input" placeholder="0" value={buy} onChange={e=>setBuy(e.target.value)} />
            
            <div className="label">{t[lang].sell}</div>
            <input type="number" className="input" placeholder="0" value={sell} onChange={e=>setSell(e.target.value)} />

            <div className="label">{t[lang].fee}</div>
            <div className="fees">
              <button className={`fee-chip ${feeType==='std'?'active':''}`} onClick={()=>setFeeType('std')}>Getgems (10%)</button>
              <button className={`fee-chip ${feeType==='custom'?'active':''}`} onClick={()=>setFeeType('custom')}>{t[lang].custom}</button>
            </div>

            {feeType === 'custom' && (
               <input type="number" className="input" placeholder="5" value={customFee} onChange={e=>setCustomFee(e.target.value)} style={{marginTop:'-10px'}}/>
            )}

            {profit !== null && (
              <div className="result">
                <div style={{fontSize:'10px', color:'#aaa'}}>{t[lang].profit}</div>
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