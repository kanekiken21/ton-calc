import { useState, useEffect } from 'react'
import './App.css'

// СЛОВАРЬ (Переводы)
const t = {
  ru: {
    title: 'Мой TON Calc',
    calcTab: 'Калькулятор',
    flipTab: 'Flip NFT',
    buy: 'Купил (TON)',
    sell: 'Продал (TON)',
    fee: 'Комиссия',
    custom: 'Своя (%)',
    profit: 'Чистый профит',
    settings: 'Настройки',
    lang: 'Язык / Language',
    about: 'О приложении',
    policy: 'Политика',
    contact: 'Поддержка',
    back: 'Закрыть'
  },
  en: {
    title: 'my TON Calc',
    calcTab: 'Calculator',
    flipTab: 'Flip NFT',
    buy: 'Buy Price (TON)',
    sell: 'Sell Price (TON)',
    fee: 'Fee Type',
    custom: 'Custom (%)',
    profit: 'Net Profit',
    settings: 'Settings',
    lang: 'Language',
    about: 'About App',
    policy: 'Policy',
    contact: 'Support',
    back: 'Close'
  },
  ua: {
    title: 'Мій TON Calc',
    calcTab: 'Калькулятор',
    flipTab: 'Flip NFT',
    buy: 'Купив (TON)',
    sell: 'Продав (TON)',
    fee: 'Комісія',
    custom: 'Своя (%)',
    profit: 'Чистий профіт',
    settings: 'Налаштування',
    lang: 'Мова / Language',
    about: 'Про додаток',
    policy: 'Політика',
    contact: 'Підтримка',
    back: 'Закрити'
  }
}

function App() {
  const [mode, setMode] = useState('calc')
  const [lang, setLang] = useState('ru') // Язык по умолчанию
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
      
      // Пытаемся узнать язык пользователя из Телеграма
      const userLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
      if (userLang === 'uk') setLang('ua');
      else if (userLang === 'en') setLang('en');
    }
    
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
  const calc = (a,b,o) => { if(o==='/')return a/b; if(o==='x')return a*b; if(o==='-')return a-b; if(o==='+')return a+b; return b; }
  const reset = () => { setDisplay('0'); setMemory(null); setOp(null); setWaiting(false); }
  const invert = () => setDisplay(String(parseFloat(display)*-1));
  const percent = () => setDisplay(String(parseFloat(display)/100));

  const getProfit = () => {
    const b = parseFloat(buy); const s = parseFloat(sell);
    if (!b || !s) return null;
    const fee = feeType === 'std' ? 10 : (parseFloat(customFee) || 0);
    return (s * (1 - fee/100) - b).toFixed(2);
  }
  const profit = getProfit();

  // --- UI COMPONENTS ---
  return (
    <>
      <div className="bg-anim"></div>

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="guide-overlay" onClick={()=>setShowSettings(false)}>
          <div className="guide-card" onClick={e=>e.stopPropagation()}>
            <h3>{t[lang].settings} ⚙️</h3>
            
            <div className="label" style={{marginTop:'20px'}}>{t[lang].lang}</div>
            <div className="fees">
              <button className={`fee-chip ${lang==='ru'?'active':''}`} onClick={()=>setLang('ru')}>RU</button>
              <button className={`fee-chip ${lang==='en'?'active':''}`} onClick={()=>setLang('en')}>EN</button>
              <button className={`fee-chip ${lang==='ua'?'active':''}`} onClick={()=>setLang('ua')}>UA</button>
            </div>

            <div className="label" style={{marginTop:'15px'}}>Info</div>
            <button className="fee-chip" style={{width:'100%', marginBottom:'10px'}} onClick={()=>window.open('https://t.me/euharbar')}>
              {t[lang].contact} (@euharbar)
            </button>
            
            <button className="btn neon" style={{borderRadius:'15px', fontSize:'16px', height:'50px', marginTop:'20px'}} 
              onClick={()=>setShowSettings(false)}>
              {t[lang].back}
            </button>
          </div>
        </div>
      )}

      {/* MAIN ISLAND */}
      <div className="island">
        
        {/* HEADER */}
        <div className="header">
          <div className="app-title">{t[lang].title}</div>
          <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
             <div className="price">💎 ${tonPrice || '...'}</div>
             {/* Кнопка настроек */}
             <div onClick={()=>setShowSettings(true)} style={{cursor:'pointer', fontSize:'20px'}}>⚙️</div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs">
          <button className={`tab ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>{t[lang].calcTab}</button>
          <button className={`tab ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>{t[lang].flipTab}</button>
        </div>

        {/* CALC */}
        {mode === 'calc' && (
          <div style={{animation:'fadeIn 0.3s', width:'100%'}}>
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

        {/* FLIP */}
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