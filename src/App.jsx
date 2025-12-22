import { useState, useEffect, useRef } from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import './App.css'

// ICONS
const IconHome = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconApp = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IconSet = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconSkip = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>;
const IconPrev = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>;

const tracks = [
  { title: "Night Train", src: "/music/track1.mp3" },
  { title: "Cyber Rain", src: "/music/track2.mp3" },
  { title: "Deep Space", src: "/music/track3.mp3" }
];

const t = {
  en: { 
    welcome: "Welcome!", sub: "Your ultimate TON tool.", 
    nav_home: "Home", nav_app: "App", nav_set: "Settings",
    calc: "Calculator", flip: "Flip NFT", 
    buy: "Buy Price", sell: "Sell Price", fee: "Fee %",
    net: "Net Profit",
    sets: "Settings", news: "News", lang: "Language",
    relax: "RELAX", theme: "THEME"
  },
  ru: { 
    welcome: "Привет!", sub: "Твой главный инструмент в TON.", 
    nav_home: "Главная", nav_app: "Утилиты", nav_set: "Настр.",
    calc: "Калькулятор", flip: "Флип NFT", 
    buy: "Покупка", sell: "Продажа", fee: "Комиссия %",
    net: "Профит",
    sets: "Настройки", news: "Новости", lang: "Язык",
    relax: "РЕЛАКС", theme: "ТЕМА"
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [appMode, setAppMode] = useState('calc');
  const [lang, setLang] = useState('en'); // Default EN
  const [tonPrice, setTonPrice] = useState('...');
  const [snowflakes, setSnowflakes] = useState([]);
  
  // STATES
  const [display, setDisplay] = useState('0');
  const [buy, setBuy] = useState('');
  const [sell, setSell] = useState('');
  const [fee, setFee] = useState('');
  
  // LOFI
  const [isLofi, setIsLofi] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Auto-detect language
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
      const userLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
      if (userLang === 'ru' || userLang === 'be' || userLang === 'uk') {
        setLang('ru');
      }
    }
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r=>r.json()).then(d=>setTonPrice(parseFloat(d.price).toFixed(2))).catch(()=>{});
    
    setSnowflakes(Array.from({length:35}).map((_,i)=>({id:i, left:Math.random()*100+'%', dur:Math.random()*5+5+'s'})));
  }, []);

  const safeLink = (url) => {
    if(window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank');
  }

  // Calc Logic
  const num = (n) => { if(display.length<9) setDisplay(display==='0'?String(n):display+n); }
  const reset = () => setDisplay('0');
  const solve = () => { try { setDisplay(String(eval(display.replace('x','*'))).slice(0,9)); } catch {} }

  // Flip Logic
  const profit = buy && sell ? (sell * (1 - (parseFloat(fee)||10)/100) - buy).toFixed(2) : null;

  // Lofi Logic
  const togglePlay = () => {
    if(playing) audioRef.current.pause(); else audioRef.current.play();
    setPlaying(!playing);
  }
  const changeTrack = (idx) => {
    setTrackIdx(idx); setPlaying(true);
    setTimeout(()=>audioRef.current.play(), 50);
  }

  return (
    <div className="mobile-frame">
       <div className="ambient-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="snow-container">
             {snowflakes.map(s=><div key={s.id} className="snowflake" style={{left:s.left, animationDuration:s.dur}}>❄</div>)}
          </div>
       </div>

       {/* SCROLLABLE AREA */}
       <div className={`scroll-content ${activeTab==='home'?'centered':''}`}>
          
          {/* HOME */}
          {activeTab === 'home' && (
            <div className="fade-in">
               <div className="mascot-wrap">
                  <div className="neon-circle"></div>
                  <img src="/img/chibi-happy.png" className="mascot-img" />
               </div>
               <h1 className="h1-title">{t[lang].welcome}</h1>
               <p className="sub-text">{t[lang].sub}</p>
               
               <div className="banners-label">{t[lang].explore}</div>
               <div className="banners-row">
                  <div className="banner-card" onClick={()=>setIsLofi(true)}>
                     <video src="/video/banner-tonusic.mp4" className="banner-vid" autoPlay loop muted playsInline />
                     <div className="banner-info"><div className="b-tag">{t[lang].relax}</div><div className="b-title">TONUSIC</div></div>
                  </div>
                  <div className="banner-card">
                     <video src="/video/banner-matrix.mp4" className="banner-vid" autoPlay loop muted playsInline />
                     <div className="banner-info"><div className="b-tag">{t[lang].theme}</div><div className="b-title">MATRIX</div></div>
                  </div>
               </div>
            </div>
          )}

          {/* APP */}
          {activeTab === 'app' && (
            <div className="fade-in" style={{width:'100%'}}>
               <div className="tools-head">
                  <div className="ton-price-pill">💎 TON: ${tonPrice}</div>
                  <div className="switcher">
                     <button className={`switch-item ${appMode==='calc'?'active':''}`} onClick={()=>setAppMode('calc')}>{t[lang].calc}</button>
                     <button className={`switch-item ${appMode==='flip'?'active':''}`} onClick={()=>setAppMode('flip')}>{t[lang].flip}</button>
                  </div>
               </div>

               {appMode === 'calc' ? (
                 <>
                   <div className="calc-screen">{display}</div>
                   <div className="keypad-grid">
                     <button className="k-btn ac" onClick={reset}>AC</button>
                     <button className="k-btn" onClick={()=>setDisplay(display.slice(0,-1))}>⌫</button>
                     <button className="k-btn" onClick={()=>setDisplay(display+'%')}>%</button>
                     <button className="k-btn op" onClick={()=>setDisplay(display+'/')}>÷</button>
                     <button className="k-btn" onClick={()=>num(7)}>7</button>
                     <button className="k-btn" onClick={()=>num(8)}>8</button>
                     <button className="k-btn" onClick={()=>num(9)}>9</button>
                     <button className="k-btn op" onClick={()=>setDisplay(display+'*')}>×</button>
                     <button className="k-btn" onClick={()=>num(4)}>4</button>
                     <button className="k-btn" onClick={()=>num(5)}>5</button>
                     <button className="k-btn" onClick={()=>num(6)}>6</button>
                     <button className="k-btn op" onClick={()=>setDisplay(display+'-')}>−</button>
                     <button className="k-btn" onClick={()=>num(1)}>1</button>
                     <button className="k-btn" onClick={()=>num(2)}>2</button>
                     <button className="k-btn" onClick={()=>num(3)}>3</button>
                     <button className="k-btn op" onClick={()=>setDisplay(display+'+')}>+</button>
                     <button className="k-btn zero" onClick={()=>num(0)}>0</button>
                     <button className="k-btn" onClick={()=>setDisplay(display+'.')}>.</button>
                     <button className="k-btn eq" onClick={solve}>=</button>
                   </div>
                 </>
               ) : (
                 <div style={{width:'100%'}}>
                    <input className="glass-inp" type="number" placeholder={t[lang].buy} value={buy} onChange={e=>setBuy(e.target.value)} />
                    <input className="glass-inp" type="number" placeholder={t[lang].sell} value={sell} onChange={e=>setSell(e.target.value)} />
                    <input className="glass-inp" type="number" placeholder={t[lang].fee} value={fee} onChange={e=>setFee(e.target.value)} />
                    
                    {profit && (
                      <div className="res-box">
                         <div style={{fontSize:12, opacity:0.6}}>{t[lang].net}</div>
                         <div className="res-val" style={{color:profit>=0?'#32d74b':'#ff453a'}}>{profit} TON</div>
                         <div style={{opacity:0.5}}>≈ ${(profit*tonPrice).toFixed(2)}</div>
                      </div>
                    )}
                 </div>
               )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
             <div className="fade-in" style={{width:'100%'}}>
                <h2 className="h1-title" style={{marginBottom:20}}>{t[lang].sets}</h2>
                <div style={{display:'flex', justifyContent:'center', marginBottom:20}}>
                   <TonConnectButton />
                </div>
                <div className="settings-list">
                   <div className="setting-item" onClick={()=>setLang(lang==='en'?'ru':'en')}>
                      <span>🌐 {t[lang].lang}</span> <span style={{opacity:0.5}}>{lang.toUpperCase()}</span>
                   </div>
                   <div className="setting-item" onClick={()=>safeLink('https://t.me/mytoncalculator')}>
                      <span>📢 {t[lang].news}</span> <span>↗</span>
                   </div>
                </div>
             </div>
          )}
       </div>

       {/* LOFI OVERLAY */}
       {isLofi && (
         <div className="lofi-full fade-in">
            <div className="close-btn" onClick={()=>{setIsLofi(false); if(playing) audioRef.current.pause(); setPlaying(false)}}>✕</div>
            <video src="/video/lofi-train.mp4" className="lofi-vid" autoPlay loop muted playsInline />
            
            <div className="lofi-ui">
               <div className="lofi-playlist">
                  {tracks.map((tr, i) => (
                     <div key={i} className={`track-row ${trackIdx===i?'active':''}`} onClick={()=>changeTrack(i)}>
                        {i+1}. {tr.title}
                     </div>
                  ))}
               </div>
               
               <div className="lofi-controls">
                  <svg className="ctrl-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                       onClick={()=>{let n=trackIdx-1; if(n<0)n=tracks.length-1; changeTrack(n)}}>
                     <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>
                  </svg>
                  
                  <div className="play-circle" onClick={togglePlay}>
                     {playing ? '⏸' : '▶'}
                  </div>
                  
                  <svg className="ctrl-icon" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                       onClick={()=>{let n=trackIdx+1; if(n>=tracks.length)n=0; changeTrack(n)}}>
                     <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>
                  </svg>
               </div>
               <audio ref={audioRef} src={tracks[trackIdx].src} loop />
            </div>
         </div>
       )}

       {/* NAV BAR */}
       {!isLofi && (
         <div className="nav-bar">
            <div className={`nav-btn ${activeTab==='settings'?'active':''}`} onClick={()=>setActiveTab('settings')}>
               <IconSet/> <span>{t[lang].nav_set}</span>
            </div>
            <div className="nav-center">
               <div className="home-btn" onClick={()=>setActiveTab('home')}><IconHome/></div>
            </div>
            <div className={`nav-btn ${activeTab==='app'?'active':''}`} onClick={()=>setActiveTab('app')}>
               <IconApp/> <span>{t[lang].nav_app}</span>
            </div>
         </div>
       )}
    </div>
  )
}

export default App