import { useState, useEffect } from 'react'
import './App.css'

const t = {
  ru: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купил (TON)', sell: 'Продал (TON)', profit: 'Прибыль', sets: 'Настройки', close: 'Закрыть', custom: 'Своя (%)', news: 'Новости', donate: 'Donate' },
  en: { calc: 'Calculator', flip: 'Flip NFT', buy: 'Buy Price', sell: 'Sell Price', profit: 'Net Profit', sets: 'Settings', close: 'Close', custom: 'Custom (%)', news: 'News Channel', donate: 'Donate' },
  ua: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купив', sell: 'Продав', profit: 'Прибуток', sets: 'Налаштування', close: 'Закрити', custom: 'Своя (%)', news: 'Новини', donate: 'Donate' }
}

function App() {
  const [mode, setMode] = useState('calc') 
  const [lang, setLang] = useState('ru')
  const [showSettings, setShowSettings] = useState(false)
  const [tonPrice, setTonPrice] = useState(null)

  // Flip
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')
  const [feeType, setFeeType] = useState('std') 
  const [customFee, setCustomFee] = useState('')

  // Calc
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
    
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.20'));
  }, [])

  // ACTIONS
  const openLink = (url) => window.open(url, '_blank');
  
  const handleDonate = () => {
    // В идеале тут нужен запрос на бэкенд. 
    // Пока открываем CryptoBot или твой канал с инструкцией.
    openLink('https://t.me/CryptoBot'); 
  }

  // CALC
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

  // FLIP
  const getProfit = () => {
    const b = parseFloat(buy); const s = parseFloat(sell);
    if (!b || !s) return null;
    const fee = feeType === 'std' ? 10 : (parseFloat(customFee) || 0);
    return (s * (1 - fee/100) - b).toFixed(2);
  }
  const profit = getProfit();

  return (
    <>
      <div className="bg-aurora"></div>

      <div className="island">
        
        {/* HEADER */}
        <div className="header">
          <div className="brand">
            <span className="app-title">my TON Calc</span>
            <span className="beta">BETA</span>
          </div>
          <div className="settings-btn" onClick={()=>setShowSettings(true)}>⚙️</div>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button className={`tab ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>{t[lang].calc}</button>
          <button className={`tab ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>{t[lang].flip}</button>
        </div>

        {/* SETTINGS MENU (NEW DESIGN) */}
        {showSettings && (
          <div className="modal-overlay">
            <h3 style={{marginBottom:'25px', color:'white'}}>{t[lang].sets}</h3>
            
            <div className="lang-row">
              <button className={`lang-chip ${lang==='ru'?'active':''}`} onClick={()=>setLang('ru')}>RU</button>
              <button className={`lang-chip ${lang==='en'?'active':''}`} onClick={()=>setLang('en')}>EN</button>
              <button className={`lang-chip ${lang==='ua'?'active':''}`} onClick={()=>setLang('ua')}>UA</button>
            </div>

            <div className="menu-list">
              <button className="menu-btn" onClick={()=>openLink('https://t.me/mytoncalculator')}>
                <span>📢 {t[lang].news}</span>
                <span style={{opacity:0.5}}>↗</span>
              </button>
              
              <button className="menu-btn gold" onClick={handleDonate}>
                <span>⭐️ {t[lang].donate}</span>
                <span>♥</span>
              </button>
            </div>

            <div style={{marginTop:'auto', width:'100%', display:'flex', justifyContent:'center'}}>
               <button className="btn" style={{borderRadius:'20px', fontSize:'16px', background:'rgba(255,255,255,0.1)'}} onClick={()=>setShowSettings(false)}>
                 ✕
               </button>
            </div>
          </div>
        )}

        {/* CALC MODE */}
        {mode === 'calc' && (
          <div style={{width:'100%', animation:'fadeIn 0.3s'}}>
            <div className="screen">{display}</div>
            <div className="keypad">
              <button className="btn" onClick={reset} style={{color:'#ff453a'}}>AC</button>
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

        {/* FLIP MODE */}
        {mode === 'flip' && (
          <div style={{width:'100%', animation:'fadeIn 0.3s'}}>
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