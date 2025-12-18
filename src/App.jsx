import { useState, useEffect } from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import './App.css'

const t = {
  ru: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купил', sell: 'Продал', profit: 'Прибыль', sets: 'Настройки', close: 'Закрыть', custom: 'Своя (%)', news: 'Новости', donate: 'Донат', donatePlaceholder: 'Сумма (TON)', wallet: 'Кошелек', welcomeBtn: 'Погнали!' },
  en: { calc: 'Calculator', flip: 'Flip NFT', buy: 'Buy Price', sell: 'Sell Price', profit: 'Net Profit', sets: 'Settings', close: 'Close', custom: 'Custom (%)', news: 'News Channel', donate: 'Donate', donatePlaceholder: 'Amount (TON)', wallet: 'Wallet', welcomeBtn: "Let's Go!" },
  ua: { calc: 'Калькулятор', flip: 'Flip NFT', buy: 'Купив', sell: 'Продав', profit: 'Прибуток', sets: 'Налаштування', close: 'Закрити', custom: 'Своя (%)', news: 'Новини', donate: 'Донат', donatePlaceholder: 'Сума (TON)', wallet: 'Гаманець', welcomeBtn: 'Поїхали!' }
}

function App() {
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [mode, setMode] = useState('calc') 
  const [lang, setLang] = useState('en')
  const [showSettings, setShowSettings] = useState(false)
  const [tonPrice, setTonPrice] = useState(null)
  const [snowflakes, setSnowflakes] = useState([])

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
      window.Telegram.WebApp.isVerticalSwipesEnabled = false; 
      const userLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
      if (userLang === 'ru' || userLang === 'be') setLang('ru');
      else if (userLang === 'uk') setLang('ua');
    }

    const hasVisited = localStorage.getItem('hasMetTony');
    if (!hasVisited) setShowWelcome(true);

    // Снег (более заметный)
    const flakes = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      animDuration: Math.random() * 5 + 6 + 's',
      animDelay: Math.random() * 5 + 's',
      opacity: Math.random() * 0.7 + 0.3,
      size: Math.random() * 6 + 4 + 'px'
    }));
    setSnowflakes(flakes);

    setTimeout(() => setLoading(false), 2000);
    
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.20'));
  }, [])

  const closeWelcome = () => {
    localStorage.setItem('hasMetTony', 'true');
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

  // Calc Logic
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
        {/* СФЕРЫ (ORBS) */}
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        
        {/* СНЕГ */}
        <div className="snow-container">
          {snowflakes.map(f => (
            <div key={f.id} className="snowflake" style={{
              left: f.left, animationDuration: f.animDuration, animationDelay: f.animDelay, opacity: f.opacity, fontSize: f.size
            }}>❄</div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="splash">
           <img src="/img/logo-v2.png" alt="Logo" className="splash-logo-img" />
        </div>
      )}

      {!loading && showWelcome && (
        <div className="welcome-overlay">
           <div className="welcome-content">
              <img src="/img/chibi-happy.png" className="welcome-img" alt="Tony" />
              <h2>Hi, I'm Tony! 💎</h2>
              <button className="btn neon-btn" style={{marginTop:'20px', borderRadius:'16px', width:'100%'}} onClick={closeWelcome}>
                {t[lang].welcomeBtn}
              </button>
           </div>
        </div>
      )}

      {/* Убрал 'blur-bg' из логики, чтобы фон не мылило при настройках, это мешает модалке */}
      <div className="island-wrapper">
        <div className="island">
          
          <div className="header">
            <div className="brand">
              <img src="/img/logo-v2.png" alt="Logo" className="logo-v2" />
              <div className="brand-text">
                 <span className="app-title">my TON Calc</span>
                 <div className="ton-price">💎 {tonPrice ? `$${tonPrice}` : '...'}</div>
              </div>
            </div>
            <div className="settings-btn" onClick={()=>setShowSettings(true)}>⚙️</div>
          </div>

          <div className="tabs">
            <button className={`tab ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>{t[lang].calc}</button>
            <button className={`tab ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>{t[lang].flip}</button>
          </div>

          {showSettings && (
            <div className="modal-overlay">
              <div className="modal-content">
                  <h3 style={{color:'white', textAlign:'center', marginTop:0}}>{t[lang].sets}</h3>
                  <div style={{display:'flex', justifyContent:'center', marginBottom:'20px'}}>
                    <TonConnectButton />
                  </div>
                  
                  <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                    <button className={`tab ${lang==='ru'?'active':''}`} onClick={()=>setLang('ru')}>RU</button>
                    <button className={`tab ${lang==='en'?'active':''}`} onClick={()=>setLang('en')}>EN</button>
                    <button className={`tab ${lang==='ua'?'active':''}`} onClick={()=>setLang('ua')}>UA</button>
                  </div>

                  <button className="menu-btn" onClick={()=>safeOpenLink('https://t.me/mytoncalculator')}>
                    <span>📢 {t[lang].news}</span> <span>↗</span>
                  </button>

                  <div style={{display:'flex', gap:'10px'}}>
                     <input type="number" className="glass-input" style={{fontSize:'16px', padding:'12px', height:'auto', margin:0}} 
                            placeholder={t[lang].donatePlaceholder} value={donateAmount} onChange={e=>setDonateAmount(e.target.value)} />
                     <button className="menu-btn" style={{width:'60px', marginBottom:0, background:'#FFD700', color:'#000', justifyContent:'center', fontWeight:'bold'}} onClick={handleDonate}>
                        {isDonating ? '...' : '⭐️'}
                     </button>
                  </div>

                  <button className="btn clean-btn" style={{marginTop:'20px', width:'100%', height:'50px', fontSize:'18px'}} onClick={()=>setShowSettings(false)}>
                    ✕ {t[lang].close}
                  </button>
              </div>
            </div>
          )}

          {mode === 'calc' && (
            <>
              <div className="screen">{display}</div>
              <div className="keypad">
                <button className="btn clean-btn" onClick={reset}>AC</button>
                <button className="btn num-btn" onClick={invert}>+/-</button>
                <button className="btn num-btn" onClick={percent}>%</button>
                <button className="btn op-btn" onClick={()=>operator('/')}>÷</button>
                
                <button className="btn num-btn" onClick={()=>num(7)}>7</button>
                <button className="btn num-btn" onClick={()=>num(8)}>8</button>
                <button className="btn num-btn" onClick={()=>num(9)}>9</button>
                <button className="btn op-btn" onClick={()=>operator('x')}>×</button>
                
                <button className="btn num-btn" onClick={()=>num(4)}>4</button>
                <button className="btn num-btn" onClick={()=>num(5)}>5</button>
                <button className="btn num-btn" onClick={()=>num(6)}>6</button>
                <button className="btn op-btn" onClick={()=>operator('-')}>−</button>
                
                <button className="btn num-btn" onClick={()=>num(1)}>1</button>
                <button className="btn num-btn" onClick={()=>num(2)}>2</button>
                <button className="btn num-btn" onClick={()=>num(3)}>3</button>
                <button className="btn op-btn" onClick={()=>operator('+')}>+</button>
                
                <button className="btn num-btn zero-btn" onClick={()=>num(0)}>0</button>
                <button className="btn num-btn" onClick={()=>{if(!display.includes('.'))setDisplay(display+'.')}}>.</button>
                <button className="btn neon-btn" onClick={()=>operator('=')}>=</button>
              </div>
            </>
          )}

          {mode === 'flip' && (
            <div className="flip-cont">
              <div className="label">{t[lang].buy} (TON)</div>
              <input type="number" className="glass-input" placeholder="0" value={buy} onChange={e=>setBuy(e.target.value)} />
              
              <div className="label">{t[lang].sell} (TON)</div>
              <input type="number" className="glass-input" placeholder="0" value={sell} onChange={e=>setSell(e.target.value)} />

              <div style={{display:'flex', gap:'8px'}}>
                <button className={`tab ${feeType==='std'?'active':''}`} onClick={()=>setFeeType('std')}>Getgems (10%)</button>
                <button className={`tab ${feeType==='custom'?'active':''}`} onClick={()=>setFeeType('custom')}>{t[lang].custom}</button>
              </div>
              {feeType === 'custom' && (
                 <input type="number" className="glass-input" placeholder="5" value={customFee} onChange={e=>setCustomFee(e.target.value)} />
              )}

              {profit !== null ? (
                <>
                  <div className="result">
                    <div style={{fontSize:'12px', color:'#aaa'}}>{t[lang].profit}</div>
                    <div className="res-val" style={{color: parseFloat(profit) >= 0 ? '#32d74b' : '#ff453a'}}>
                      {parseFloat(profit)>0?'+':''}{profit} TON
                    </div>
                  </div>
                  <div className="mascot-wrapper">
                     <div className="mascot-glow"></div>
                     <img src={parseFloat(profit) >= 0 ? "/img/chibi-happy.png" : "/img/chibi-sad.png"} className="mascot-img" alt="Tony" />
                  </div>
                </>
              ) : (
                 <div className="mascot-wrapper">
                     <div className="mascot-glow"></div>
                     <img src="/img/chibi-happy.png" className="mascot-img" style={{opacity:0.8}} alt="Idle" />
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