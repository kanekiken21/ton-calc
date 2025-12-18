import { useState, useEffect } from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import './App.css'

// ИКОНКИ
const IconHome = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconTools = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
const IconSettings = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

const t = {
  en: { 
    welcome: "Welcome!", sub: "Estimate profits and check TON price instantly.", 
    donateTitle: "Support Developer", donatePh: "Amount (TON)", send: "SEND",
    nav_home: "Home", nav_app: "App", nav_set: "Settings",
    calc: "Calculator", flip: "NFT Flip", 
    buy: "Buy Price", sell: "Sell Price", custom: "Custom %",
    net: "Net Profit",
    sets: "Settings", news: "News Channel", lang: "Language" 
  },
  ru: { 
    welcome: "Привет!", sub: "Считай профит и курс TON моментально.", 
    donateTitle: "Поддержать автора", donatePh: "Сумма (TON)", send: "ОТПРАВИТЬ",
    nav_home: "Главная", nav_app: "Утилиты", nav_set: "Настройки",
    calc: "Калькулятор", flip: "NFT Флип", 
    buy: "Покупка", sell: "Продажа", custom: "Свой %",
    net: "Чистый профит",
    sets: "Настройки", news: "Новости", lang: "Язык" 
  },
  ua: { 
    welcome: "Привіт!", sub: "Рахуй профіт та курс TON миттєво.", 
    donateTitle: "Підтримати автора", donatePh: "Сума (TON)", send: "НАДІСЛАТИ",
    nav_home: "Головна", nav_app: "Утиліти", nav_set: "Налашт.",
    calc: "Калькулятор", flip: "NFT Фліп", 
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

  const [display, setDisplay] = useState('0');
  const [waiting, setWaiting] = useState(false);
  const [op, setOp] = useState(null);
  const [memory, setMemory] = useState(null);

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
      window.Telegram.WebApp.setHeaderColor('#000510');
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
          method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (data.url) safeOpenLink(data.url);
    } catch (e) { alert('Error'); } 
    finally { setIsDonating(false); }
  }

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
  const getGlowColor = () => {
    if (profit === null) return '';
    if (parseFloat(profit) >= 0) return 'green';
    return 'red';
  }

  return (
    <div className="app-container">
      <div className="ambient-wrapper">
         <div className="orb orb-1"></div>
         <div className="orb orb-2"></div>
         <div className="snow-container">
            {snowflakes.map((s,i)=>(<div key={i} className="snowflake" style={{left:s.left, animationDuration:s.dur, animationDelay:s.delay}}>❄</div>))}
         </div>
      </div>

      <div className={`content-area ${activeTab!=='tools'?'centered':''}`}>
         
         {/* HOME */}
         {activeTab === 'home' && (
           <div className="island fade-in">
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
             <div className="tools-header fade-in">
                <div className="ton-badge"><span>💎</span> TON: ${tonPrice}</div>
                <div className="segmented-control">
                   <button className={`segment-btn ${toolMode==='calc'?'active':''}`} onClick={()=>setToolMode('calc')}>{t[lang].calc}</button>
                   <button className={`segment-btn ${toolMode==='flip'?'active':''}`} onClick={()=>setToolMode('flip')}>{t[lang].flip}</button>
                </div>
             </div>

             <div className="island fade-in">
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
                   {feeType==='custom' && <input className="glass-input" placeholder="%" value={customFee} onChange={e=>setCustomFee(e.target.value)}/>}
                   
                   {profit !== null && (
                      <div className="result-card">
                         <div style={{fontSize:'12px', color:'#aaa'}}>{t[lang].net}</div>
                         <div className="res-val" style={{color: parseFloat(profit)>=0?'#32d74b':'#ff453a'}}>
                           {parseFloat(profit)>0?'+':''}{profit} TON
                         </div>
                         <div style={{fontSize:'12px', opacity:0.5}}>≈ ${(parseFloat(profit)*parseFloat(tonPrice||0)).toFixed(2)}</div>
                         
                         <div className="mascot-display" style={{height:'100px', margin:'15px 0 0 0'}}>
                           <div className={`mascot-glow ${getGlowColor()}`} style={{width:'80px', height:'80px'}}></div>
                           <img 
                             src={parseFloat(profit) >= 0 ? "/img/chibi-happy.png" : "/img/chibi-sad.png"} 
                             style={{width:'80px', zIndex:1, animation:'popUp 0.5s'}}
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
           <div className="settings-list fade-in">
             <h2 style={{textAlign:'center', marginBottom:'20px'}}>{t[lang].sets}</h2>
             <div style={{display:'flex', justifyContent:'center', marginBottom:'20px'}}>
                <TonConnectButton />
             </div>

             <div className="setting-item">
               <div style={{display:'flex', alignItems:'center'}}><span style={{marginRight:10}}>🌐</span> {t[lang].lang}</div>
               <div className="segmented-control" style={{width:'100px'}}>
                  <button className={`segment-btn ${lang==='en'?'active':''}`} onClick={()=>setLang('en')}>EN</button>
                  <button className={`segment-btn ${lang==='ru'?'active':''}`} onClick={()=>setLang('ru')}>RU</button>
               </div>
             </div>

             <div className="setting-item" onClick={()=>safeOpenLink('https://t.me/mytoncalculator')}>
               <div style={{display:'flex', alignItems:'center'}}><span style={{marginRight:10}}>📢</span> {t[lang].news}</div>
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