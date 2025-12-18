import { useState, useEffect } from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import './App.css'

// Переводы
const t = {
  ru: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купил (TON)', sell: 'Продал (TON)', profit: 'Прибыль', sets: 'Настройки', close: 'Закрыть', custom: 'Своя (%)', news: 'Новости', donate: 'Донат', donatePlaceholder: 'Сумма (TON)', wallet: 'Кошелек', welcomeBtn: 'Погнали!' },
  en: { calc: 'Calculator', flip: 'Flip NFT', buy: 'Buy Price', sell: 'Sell Price', profit: 'Net Profit', sets: 'Settings', close: 'Close', custom: 'Custom (%)', news: 'News Channel', donate: 'Donate', donatePlaceholder: 'Amount (TON)', wallet: 'Wallet', welcomeBtn: "Let's Go!" },
  ua: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купив', sell: 'Продав', profit: 'Прибуток', sets: 'Налаштування', close: 'Закрити', custom: 'Своя (%)', news: 'Новини', donate: 'Донат', donatePlaceholder: 'Сума (TON)', wallet: 'Гаманець', welcomeBtn: 'Поїхали!' }
}

function App() {
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false) // Состояние для видео-приветствия
  const [mode, setMode] = useState('calc') 
  const [lang, setLang] = useState('en')
  const [showSettings, setShowSettings] = useState(false)
  const [tonPrice, setTonPrice] = useState(null)
  
  // States for Calc & Flip
  const [isDonating, setIsDonating] = useState(false)
  const [donateAmount, setDonateAmount] = useState('')
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')
  const [feeType, setFeeType] = useState('std') 
  const [customFee, setCustomFee] = useState('')
  const [display, setDisplay] = useState('0')
  const [waiting, setWaiting] = useState(false)
  const [op, setOp] = useState(null)
  const [memory, setMemory] = useState(null)

  useEffect(() => {
    // 1. Инициализация Telegram
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000'); 
      window.Telegram.WebApp.isVerticalSwipesEnabled = false; 
      
      const userLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
      if (userLang === 'ru' || userLang === 'be') setLang('ru');
      else if (userLang === 'uk') setLang('ua');
    }

    // 2. Проверка: видел ли юзер Тони раньше?
    const hasVisited = localStorage.getItem('hasMetTony');
    if (!hasVisited) {
      setShowWelcome(true); // Если нет - покажем видео
    }

    // 3. Убираем сплэш через 2 сек
    setTimeout(() => setLoading(false), 2000);
    
    // 4. Курс TON
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.20'));
  }, [])

  const closeWelcome = () => {
    localStorage.setItem('hasMetTony', 'true'); // Запоминаем, что юзер видел приветствие
    setShowWelcome(false);
  }

  const safeOpenLink = (url) => {
    const tg = window.Telegram?.WebApp;
    if (tg && url.startsWith('https://t.me/')) tg.openTelegramLink(url);
    else if (tg) tg.openLink(url);
    else window.open(url, '_blank');
  };

  const handleDonate = async () => {
    const amount = donateAmount && parseFloat(donateAmount) > 0 ? donateAmount : '0.1';
    setIsDonating(true);
    try {
      const res = await fetch('/api/donate', {
          method: 'POST', 
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (data.url) safeOpenLink(data.url);
    } catch (e) { alert('Error'); } 
    finally { setIsDonating(false); }
  }

  // Logic: Calculator
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

  // Logic: Flip
  const getProfit = () => {
    const b = parseFloat(buy); const s = parseFloat(sell);
    if (!b || !s) return null;
    const fee = feeType === 'std' ? 10 : (parseFloat(customFee) || 0);
    return (s * (1 - fee/100) - b).toFixed(2);
  }
  const profit = getProfit();

  return (
    <>
      <div className="ambient-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* 1. SPLASH SCREEN (Лого V2) */}
      {loading && (
        <div className="splash">
           <img src="/img/logo-v2.png" alt="Logo" className="splash-logo-img" />
          <div className="splash-text">my TON Calculator</div>
        </div>
      )}

      {/* 2. WELCOME VIDEO OVERLAY (Тони машет лапкой) */}
      {!loading && showWelcome && (
        <div className="welcome-overlay">
           <div className="welcome-content">
              <video 
                 src="/img/mascot-idle.webm" 
                 autoPlay loop muted playsInline 
                 className="welcome-video"
              />
              <h2>Hi, I'm Tony! 💎</h2>
              <p>I'll help you calculate your NFT profits.</p>
              <button className="btn neon-btn" onClick={closeWelcome}>
                {t[lang].welcomeBtn}
              </button>
           </div>
        </div>
      )}

      {/* 3. MAIN APP */}
      <div className={`island-wrapper ${showWelcome ? 'blur-bg' : ''}`}>
        <div className="island-glow"></div>
        <div className="island">
          
          {/* Header */}
          <div className="header">
            <div className="brand">
              <img src="/img/logo-v2.png" alt="Logo" className="logo-v2" />
              <div className="brand-text">
                 <span className="app-title">my TON Calc</span>
                 <div className="ton-price">💎 {tonPrice ? `$${tonPrice}` : '...'}</div>
              </div>
            </div>
            <div className="settings-btn ios-tap" onClick={()=>setShowSettings(true)}>⚙️</div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab ios-tap ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>{t[lang].calc}</button>
            <button className={`tab ios-tap ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>{t[lang].flip}</button>
          </div>

          {/* Settings Modal */}
          {showSettings && (
            <div className="modal-overlay">
              <div className="modal-content glass-panel">
                  <h3 style={{marginBottom:'15px', color:'white'}}>{t[lang].sets}</h3>
                  <div style={{width:'100%', display:'flex', justifyContent:'center', marginBottom:'15px'}}>
                    <TonConnectButton />
                  </div>
                  <div className="lang-row">
                    <button className={`lang-chip ios-tap ${lang==='ru'?'active':''}`} onClick={()=>setLang('ru')}>RU</button>
                    <button className={`lang-chip ios-tap ${lang==='en'?'active':''}`} onClick={()=>setLang('en')}>EN</button>
                    <button className={`lang-chip ios-tap ${lang==='ua'?'active':''}`} onClick={()=>setLang('ua')}>UA</button>
                  </div>
                  <div className="menu-list">
                    <button className="menu-btn ios-tap" onClick={()=>safeOpenLink('https://t.me/mytoncalculator')}>
                      <span>📢 {t[lang].news}</span>
                    </button>
                    <div style={{display:'flex', gap:'10px'}}>
                        <input type="number" className="input" placeholder={t[lang].donatePlaceholder} value={donateAmount} onChange={e=>setDonateAmount(e.target.value)} />
                        <button className="menu-btn gold ios-tap" onClick={handleDonate} disabled={isDonating}>
                          <span>{isDonating ? '...' : `⭐️ ${t[lang].donate}`}</span>
                        </button>
                    </div>
                  </div>
                  <button className="btn close-btn ios-tap" onClick={()=>setShowSettings(false)}>✕</button>
              </div>
            </div>
          )}

          {/* CALCULATOR MODE */}
          {mode === 'calc' && (
            <div style={{width:'100%', animation:'fadeIn 0.3s'}}>
              <div className="screen glass-input">{display}</div>
              <div className="keypad">
                <button className="btn ios-tap clean-btn" onClick={reset}>AC</button>
                <button className="btn ios-tap" onClick={invert}>+/-</button>
                <button className="btn ios-tap" onClick={percent}>%</button>
                <button className="btn ios-tap op-btn" onClick={()=>operator('/')}>÷</button>
                
                <button className="btn ios-tap num-btn" onClick={()=>num(7)}>7</button>
                <button className="btn ios-tap num-btn" onClick={()=>num(8)}>8</button>
                <button className="btn ios-tap num-btn" onClick={()=>num(9)}>9</button>
                <button className="btn ios-tap op-btn" onClick={()=>operator('x')}>×</button>
                
                <button className="btn ios-tap num-btn" onClick={()=>num(4)}>4</button>
                <button className="btn ios-tap num-btn" onClick={()=>num(5)}>5</button>
                <button className="btn ios-tap num-btn" onClick={()=>num(6)}>6</button>
                <button className="btn ios-tap op-btn" onClick={()=>operator('-')}>−</button>
                
                <button className="btn ios-tap num-btn" onClick={()=>num(1)}>1</button>
                <button className="btn ios-tap num-btn" onClick={()=>num(2)}>2</button>
                <button className="btn ios-tap num-btn" onClick={()=>num(3)}>3</button>
                <button className="btn ios-tap op-btn" onClick={()=>operator('+')}>+</button>
                
                <button className="btn ios-tap num-btn zero-btn" onClick={()=>num(0)}>0</button>
                <button className="btn ios-tap num-btn" onClick={()=>{if(!display.includes('.'))setDisplay(display+'.')}}>.</button>
                <button className="btn ios-tap neon-btn" onClick={()=>operator('=')}>=</button>
              </div>
            </div>
          )}

          {/* FLIP MODE */}
          {mode === 'flip' && (
            <div className="flip-cont">
              <div className="label">{t[lang].buy}</div>
              <input type="number" className="input glass-input" placeholder="0" value={buy} onChange={e=>setBuy(e.target.value)} />
              
              <div className="label">{t[lang].sell}</div>
              <input type="number" className="input glass-input" placeholder="0" value={sell} onChange={e=>setSell(e.target.value)} />

              <div className="label">{t[lang].fee}</div>
              <div className="fees">
                <button className={`fee-chip ios-tap ${feeType==='std'?'active':''}`} onClick={()=>setFeeType('std')}>Getgems (10%)</button>
                <button className={`fee-chip ios-tap ${feeType==='custom'?'active':''}`} onClick={()=>setFeeType('custom')}>{t[lang].custom}</button>
              </div>
              {feeType === 'custom' && (
                 <input type="number" className="input glass-input" placeholder="5" value={customFee} onChange={e=>setCustomFee(e.target.value)} style={{marginTop:'-10px'}}/>
              )}

              {/* RESULT & MASCOT */}
              {profit !== null ? (
                <>
                  <div className="result glass-panel">
                    <div style={{fontSize:'12px', color:'rgba(255,255,255,0.6)'}}>{t[lang].profit}</div>
                    <div className="res-val" style={{color: parseFloat(profit) >= 0 ? '#00ffa3' : '#ff453a'}}>
                      {parseFloat(profit)>0?'+':''}{profit} TON
                    </div>
                    {tonPrice && <div style={{fontSize:'12px', color:'rgba(255,255,255,0.5)'}}>≈ ${(parseFloat(profit)*tonPrice).toFixed(2)}</div>}
                  </div>
                  
                  <div className="mascot-wrapper">
                     <img 
                       src={parseFloat(profit) >= 0 ? "/img/chibi-happy.png" : "/img/chibi-sad.png"} 
                       className="mascot-img" alt="Tony"
                     />
                  </div>
                </>
              ) : (
                <div style={{height:'150px'}}></div> /* Пустое место, чтобы не прыгало */
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default App