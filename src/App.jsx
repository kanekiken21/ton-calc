import { useState, useEffect } from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import './App.css'

// Icons
const IconHome = () => <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>;
const IconTools = () => <svg viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>;
const IconSettings = () => <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.68 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>;

const t = {
  en: { 
    welcome: "Welcome!", sub: "Estimate profits and check TON price instantly.", 
    donateTitle: "Support Developer", donatePh: "Amount", send: "SEND",
    nav_home: "Home", nav_app: "App", nav_set: "Settings",
    calc: "Calculator", flip: "NFT Flip", 
    buy: "Buy Price", sell: "Sell Price", custom: "Custom %",
    net: "Net Profit",
    sets: "Settings", news: "News Channel", lang: "Language" 
  },
  ru: { 
    welcome: "Привет!", sub: "Считай профит и курс TON моментально.", 
    donateTitle: "Поддержать автора", donatePh: "Сумма", send: "ОТПРАВИТЬ",
    nav_home: "Главная", nav_app: "Утилиты", nav_set: "Настр.",
    calc: "Кальк", flip: "Флип", 
    buy: "Покупка", sell: "Продажа", custom: "Свой %",
    net: "Чистый профит",
    sets: "Настройки", news: "Канал новостей", lang: "Язык" 
  },
  ua: { 
    welcome: "Привіт!", sub: "Рахуй профіт та курс TON миттєво.", 
    donateTitle: "Підтримати автора", donatePh: "Сума", send: "НАДІСЛАТИ",
    nav_home: "Головна", nav_app: "Утиліти", nav_set: "Налашт.",
    calc: "Кальк", flip: "Фліп", 
    buy: "Купівля", sell: "Продаж", custom: "Свій %",
    net: "Чистий профіт",
    sets: "Налаштування", news: "Новини", lang: "Мова" 
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [toolMode, setToolMode] = useState('calc');
  const [lang, setLang] = useState('en');
  const [tonPrice, setTonPrice] = useState('...');
  const [snowflakes, setSnowflakes] = useState([]);

  // Calc States
  const [display, setDisplay] = useState('0');
  const [waiting, setWaiting] = useState(false);
  const [op, setOp] = useState(null);
  const [memory, setMemory] = useState(null);

  // Flip & Donate States
  const [buy, setBuy] = useState('');
  const [sell, setSell] = useState('');
  const [feeType, setFeeType] = useState('std');
  const [customFee, setCustomFee] = useState('');
  const [donateAmount, setDonateAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000a14'); 
      window.Telegram.WebApp.isVerticalSwipesEnabled = false;
      const userLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
      if (userLang === 'ru' || userLang === 'be') setLang('ru');
      else if (userLang === 'uk') setLang('ua');
    }

    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.50'));

    setSnowflakes(Array.from({ length: 40 }).map((_, i) => ({
      id: i, left: Math.random()*100+'%', delay: Math.random()*5+'s', dur: Math.random()*5+5+'s'
    })));
  }, []);

  const safeOpenLink = (url) => {
    const tg = window.Telegram?.WebApp;
    if (tg && url.startsWith('https://t.me/')) tg.openTelegramLink(url);
    else window.open(url, '_blank');
  };

  const handleDonate = async () => {
    const amount = donateAmount && parseFloat(donateAmount) > 0 ? donateAmount : '0.1';
    setIsDonating(true);
    try {
      const res = await fetch('/api/donate', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (data.url) safeOpenLink(data.url);
    } catch (e) { alert('Error'); } 
    finally { setIsDonating(false); }
  }

  // CALC Logic
  const num = (n) => {
    if (waiting) { setDisplay(String(n)); setWaiting(false); }
    else setDisplay(display === '0' ? String(n) : display + String(n));
  }
  const operator = (o) => {
    const val = parseFloat(display);
    if (memory === null) setMemory(val);
    else if (op) {
      const res = calculate(memory, val, op);
      setDisplay(String(res).slice(0, 10)); setMemory(res);
    }
    setWaiting(true); setOp(o);
  }
  const calculate = (a,b,o) => { if(o==='/')return a/b; if(o==='x')return a*b; if(o==='-')return a-b; if(o==='+')return a+b; return b; }
  const reset = () => { setDisplay('0'); setMemory(null); setOp(null); setWaiting(false); }
  const invert = () => setDisplay(String(parseFloat(display)*-1));
  const percent = () => setDisplay(String(parseFloat(display)/100));

  // FLIP Logic
  const getProfit = () => {
    const b = parseFloat(buy); const s = parseFloat(sell);
    if (!b || !s) return null;
    const fee = feeType === 'std' ? 10 : (parseFloat(customFee) || 0);
    return (s * (1 - fee/100) - b).toFixed(2);
  }
  const profit = getProfit();

  return (
    <div className="app-container">
      <div className="ambient-wrapper">
         <div className="orb orb-1"></div>
         <div className="orb orb-2"></div>
         <div className="snow-container">
            {snowflakes.map((s,i)=>(<div key={i} className="snowflake" style={{left:s.left, animationDuration:s.dur, animationDelay:s.delay}}>❄</div>))}
         </div>
      </div>

      <div className="content-area">
         
         {/* HOME */}
         {activeTab === 'home' && (
           <div className="island">
              <div className="mascot-display">
                <div className="mascot-glow"></div>
                <img src="/img/chibi-happy.png" className="mascot-main-img" alt="Tony" />
              </div>
              <h1 className="welcome-title">{t[lang].welcome}</h1>
              <p className="welcome-text">{t[lang].sub}</p>
              
              <div className="donate-card">
                <div className="donate-label">{t[lang].donateTitle} ❤️</div>
                <div style={{display:'flex', gap:'8px'}}>
                  <input type="number" className="glass-input" placeholder={t[lang].donatePh} 
                         value={donateAmount} onChange={e=>setDonateAmount(e.target.value)} />
                  <button className="donate-btn" onClick={handleDonate}>
                    {isDonating ? '...' : t[lang].send}
                  </button>
                </div>
              </div>
           </div>
         )}

         {/* TOOLS */}
         {activeTab === 'tools' && (
           <>
             <div className="tools-header">
                <div className="ton-badge">
                  <span style={{fontSize:'16px'}}>💎</span> TON: ${tonPrice}
                </div>
                <div className="segmented-control">
                   <button className={`segment-btn ${toolMode==='calc'?'active':''}`} onClick={()=>setToolMode('calc')}>{t[lang].calc}</button>
                   <button className={`segment-btn ${toolMode==='flip'?'active':''}`} onClick={()=>setToolMode('flip')}>{t[lang].flip}</button>
                </div>
             </div>

             <div className="island">
               {toolMode === 'calc' && (
                 <>
                   <div className="screen">{display}</div>
                   <div className="keypad">
                     <button className="btn clean-btn" onClick={reset}>AC</button>
                     <button className="btn" onClick={invert}>+/-</button>
                     <button className="btn" onClick={percent}>%</button>
                     <button className="btn op-btn" onClick={()=>operator('/')}>÷</button>
                     <button className="btn" onClick={()=>num(7)}>7</button>
                     <button className="btn" onClick={()=>num(8)}>8</button>
                     <button className="btn" onClick={()=>num(9)}>9</button>
                     <button className="btn op-btn" onClick={()=>operator('x')}>×</button>
                     <button className="btn" onClick={()=>num(4)}>4</button>
                     <button className="btn" onClick={()=>num(5)}>5</button>
                     <button className="btn" onClick={()=>num(6)}>6</button>
                     <button className="btn op-btn" onClick={()=>operator('-')}>−</button>
                     <button className="btn" onClick={()=>num(1)}>1</button>
                     <button className="btn" onClick={()=>num(2)}>2</button>
                     <button className="btn" onClick={()=>num(3)}>3</button>
                     <button className="btn op-btn" onClick={()=>operator('+')}>+</button>
                     <button className="btn zero-btn" onClick={()=>num(0)}>0</button>
                     <button className="btn" onClick={()=>{if(!display.includes('.'))setDisplay(display+'.')}}>.</button>
                     <button className="btn neon-btn" onClick={()=>operator('=')}>=</button>
                   </div>
                 </>
               )}

               {toolMode === 'flip' && (
                 <div className="flip-grid">
                   <input className="glass-input" type="number" placeholder={`${t[lang].buy} (TON)`} value={buy} onChange={e=>setBuy(e.target.value)}/>
                   <input className="glass-input" type="number" placeholder={`${t[lang].sell} (TON)`} value={sell} onChange={e=>setSell(e.target.value)}/>
                   
                   <div className="segmented-control">
                      <button className={`segment-btn ${feeType==='std'?'active':''}`} onClick={()=>setFeeType('std')}>Getgems (10%)</button>
                      <button className={`segment-btn ${feeType==='custom'?'active':''}`} onClick={()=>setFeeType('custom')}>{t[lang].custom}</button>
                   </div>
                   {feeType==='custom' && <input className="glass-input" placeholder="Fee %" value={customFee} onChange={e=>setCustomFee(e.target.value)}/>}
                   
                   {profit !== null && (
                      <div className="result-card">
                         <div style={{fontSize:'12px', color:'#aaa'}}>{t[lang].net}</div>
                         <div className="res-val" style={{color: parseFloat(profit)>=0?'#32d74b':'#ff453a'}}>
                           {parseFloat(profit)>0?'+':''}{profit} TON
                         </div>
                         <div style={{fontSize:'12px', opacity:0.5}}>≈ ${(parseFloat(profit)*parseFloat(tonPrice||0)).toFixed(2)}</div>
                         
                         {/* КОТ РЕАГИРУЕТ НА ПРОФИТ */}
                         <div style={{marginTop:'15px', display:'flex', justifyContent:'center'}}>
                           <img 
                             src={parseFloat(profit) >= 0 ? "/img/chibi-happy.png" : "/img/chibi-sad.png"} 
                             style={{width:'100px', filter: parseFloat(profit)>=0 ? 'drop-shadow(0 0 15px #32d74b)' : 'drop-shadow(0 0 15px #ff453a)'}}
                           />
                         </div>
                      </div>
                   )}
                 </div>
               )}
             </div>
           </>
         )}

         {/* SETTINGS */}
         {activeTab === 'settings' && (
           <div className="settings-list">
             <h2 style={{textAlign:'center', marginBottom:'20px'}}>{t[lang].sets}</h2>
             <div style={{display:'flex', justifyContent:'center', marginBottom:'20px'}}>
                <TonConnectButton />
             </div>

             <div className="setting-item">
               <div style={{display:'flex', alignItems:'center'}}><span className="set-icon">🌐</span> {t[lang].lang}</div>
               <div className="segmented-control" style={{width:'120px'}}>
                  <button className={`segment-btn ${lang==='en'?'active':''}`} onClick={()=>setLang('en')}>EN</button>
                  <button className={`segment-btn ${lang==='ru'?'active':''}`} onClick={()=>setLang('ru')}>RU</button>
               </div>
             </div>

             <div className="setting-item" onClick={()=>safeOpenLink('https://t.me/mytoncalculator')}>
               <div style={{display:'flex', alignItems:'center'}}><span className="set-icon">📢</span> {t[lang].news}</div>
               <span style={{opacity:0.5}}>↗</span>
             </div>
           </div>
         )}
      </div>

      <div className="bottom-nav">
         <div className={`nav-item ${activeTab==='settings'?'active':''}`} onClick={()=>setActiveTab('settings')}>
            <IconSettings /> <span>{t[lang].nav_set}</span>
         </div>
         <div className="center-btn-wrapper" onClick={()=>setActiveTab('home')}>
            <div className="center-btn"><IconHome /></div>
         </div>
         <div className={`nav-item ${activeTab==='tools'?'active':''}`} onClick={()=>setActiveTab('tools')}>
            <IconTools /> <span>{t[lang].nav_app}</span>
         </div>
      </div>
    </div>
  )
}

export default App