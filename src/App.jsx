import { useState, useEffect } from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import './App.css'

// СЛОВАРЬ (Мультиязычность)
const t = {
  ru: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купил (TON)', sell: 'Продал (TON)', profit: 'Прибыль', sets: 'Настройки', close: 'Закрыть', custom: 'Своя (%)', news: 'Новости', donate: 'Донат', donatePlaceholder: 'Сумма (TON)', wallet: 'Кошелек' },
  en: { calc: 'Calculator', flip: 'Flip NFT', buy: 'Buy Price', sell: 'Sell Price', profit: 'Net Profit', sets: 'Settings', close: 'Close', custom: 'Custom (%)', news: 'News Channel', donate: 'Donate', donatePlaceholder: 'Amount (TON)', wallet: 'Wallet' },
  ua: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купив', sell: 'Продав', profit: 'Прибуток', sets: 'Налаштування', close: 'Закрити', custom: 'Своя (%)', news: 'Новини', donate: 'Донат', donatePlaceholder: 'Сума (TON)', wallet: 'Гаманець' }
}

function App() {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState('calc') 
  
  // ВАЖНО: Английский по умолчанию для модерации
  const [lang, setLang] = useState('en')
  
  const [showSettings, setShowSettings] = useState(false)
  const [tonPrice, setTonPrice] = useState(null)
  
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
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
      // Блокируем вертикальный свайп (для стабильности)
      window.Telegram.WebApp.isVerticalSwipesEnabled = false; 
      
      // ЛОГИКА ЯЗЫКА (Compliance)
      const userLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
      
      // Включаем RU только для русских и белорусов
      if (userLang === 'ru' || userLang === 'be') {
        setLang('ru');
      } 
      // Включаем UA для украинцев
      else if (userLang === 'uk') {
        setLang('ua');
      }
      // Для всех остальных (en, de, fr, es...) останется 'en' (дефолтный)
    }
    
    // Имитация загрузки + получение курса
    setTimeout(() => setLoading(false), 2500);
    
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.20'));
  }, [])

  // --- НАВИГАЦИЯ ---
  const safeOpenLink = (url) => {
    const tg = window.Telegram?.WebApp;
    if (tg && url.startsWith('https://t.me/')) {
        tg.openTelegramLink(url);
    } else if (tg) {
        tg.openLink(url);
    } else {
        window.open(url, '_blank');
    }
  };

  // --- ДОНАТ ---
  const handleDonate = async () => {
    const amount = donateAmount && parseFloat(donateAmount) > 0 ? donateAmount : '0.1';
    setIsDonating(true);
    try {
      const res = await fetch('/api/donate', {
          method: 'POST', 
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ amount })
      });
      
      // Проверка на HTML ошибку (если API недоступно)
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server Error (Check /api folder)");
      }

      const data = await res.json();
      if (data.url) {
        safeOpenLink(data.url);
      } else {
        alert('CryptoBot Error: ' + (data.error || 'Unknown'));
      }
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setIsDonating(false);
    }
  }

  // --- КАЛЬКУЛЯТОР ---
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

  // --- FLIP ---
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

      {loading && (
        <div className="splash">
           {/* НОВОГОДНИЙ ЛОГОТИП */}
           <svg className="splash-logo" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="frostGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0   0 0 0 0 0.7   0 0 0 0 1  0 0 0 1 0" result="frostBlue"/>
                <feMerge>
                  <feMergeNode in="frostBlue" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="paint0_linear_ny" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007AFF"/>
                <stop offset="1" stopColor="#80FFFF"/>
              </linearGradient>
              <linearGradient id="paint1_linear_ny" x1="100" y1="100" x2="100" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#80FFFF"/>
                <stop offset="1" stopColor="#007AFF"/>
              </linearGradient>
            </defs>

            <g filter="url(#frostGlow)">
              <path d="M100 0L186.603 50V150L100 200L13.3975 150V50L100 0Z" fill="url(#paint0_linear_ny)"/>
              <path d="M100 200L13.3975 150L100 100L186.603 150L100 200Z" fill="url(#paint1_linear_ny)"/>
              {/* Снег */}
              <circle cx="50" cy="30" r="3" fill="white" opacity="0.8" />
              <circle cx="150" cy="60" r="2.5" fill="white" opacity="0.7" />
              <circle cx="100" cy="100" r="4" fill="white" opacity="0.9" />
              <circle cx="30" cy="150" r="2" fill="white" opacity="0.6" />
              <circle cx="170" cy="130" r="3.5" fill="white" opacity="0.8" />
              <circle cx="80" cy="180" r="2" fill="white" opacity="0.7" />
              <circle cx="120" cy="10" r="2.5" fill="white" opacity="0.8" />
              <circle cx="10" cy="80" r="3" fill="white" opacity="0.6" />
              <circle cx="190" cy="90" r="2" fill="white" opacity="0.7" />
            </g>
          </svg>
          <div className="splash-text">my TON Calculator</div>
        </div>
      )}

      <div className="island-wrapper">
        <div className="island-glow"></div>
        <div className="island">
          
          <div className="header">
            <div className="brand">
              <span className="app-title">my TON Calc</span>
              <div className="ton-price">
                 <span className="ton-icon">💎</span> 
                 {tonPrice ? `$${tonPrice}` : '...'}
              </div>
            </div>
            <span className="beta">BETA</span>
            <div className="settings-btn" onClick={()=>setShowSettings(true)}>⚙️</div>
          </div>

          <div className="tabs">
            <button className={`tab ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>{t[lang].calc}</button>
            <button className={`tab ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>{t[lang].flip}</button>
          </div>

          {/* SETTINGS + WALLET */}
          {showSettings && (
            <div className="modal-overlay">
              <div className="modal-content">
                  <h3 style={{marginBottom:'15px', color:'white', textAlign:'center'}}>{t[lang].sets}</h3>
                  
                  {/* КНОПКА КОШЕЛЬКА */}
                  <div style={{width:'100%', display:'flex', justifyContent:'center', marginBottom:'15px'}}>
                    <TonConnectButton />
                  </div>

                  <div className="lang-row">
                    <button className={`lang-chip ${lang==='ru'?'active':''}`} onClick={()=>setLang('ru')}>RU</button>
                    <button className={`lang-chip ${lang==='en'?'active':''}`} onClick={()=>setLang('en')}>EN</button>
                    <button className={`lang-chip ${lang==='ua'?'active':''}`} onClick={()=>setLang('ua')}>UA</button>
                  </div>

                  <div className="menu-list">
                    <button className="menu-btn" onClick={()=>safeOpenLink('https://t.me/mytoncalculator')}>
                      <span>📢 {t[lang].news}</span>
                      <span style={{opacity:0.5}}>↗</span>
                    </button>
                    
                    <div style={{display:'flex', gap:'10px'}}>
                        <input type="number" className="input" style={{marginBottom:0, flex:1, fontSize:'16px', padding:'12px', textAlign:'left'}} 
                               placeholder={t[lang].donatePlaceholder} value={donateAmount} onChange={e=>setDonateAmount(e.target.value)} />
                        
                        <button className="menu-btn gold" style={{flex:0.8, justifyContent:'center'}} onClick={handleDonate} disabled={isDonating}>
                          <span>{isDonating ? '...' : `⭐️ ${t[lang].donate}`}</span>
                        </button>
                    </div>
                  </div>

                  <button className="btn" style={{borderRadius:'20px', fontSize:'18px', background:'rgba(255,255,255,0.08)', marginTop:'20px', width:'100%'}} onClick={()=>setShowSettings(false)}>
                    ✕
                  </button>
              </div>
            </div>
          )}

          {mode === 'calc' && (
            <div style={{width:'100%', animation:'fadeIn 0.3s'}}>
              <div className="screen">{display}</div>
              <div className="keypad">
                <button className="btn" onClick={reset} style={{color:'#ff453a'}}>AC</button>
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
                  {tonPrice && <div style={{fontSize:'12px', color:'#888', marginTop:'5px'}}>≈ ${(parseFloat(profit)*tonPrice).toFixed(2)}</div>}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default App