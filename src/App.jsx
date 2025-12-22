import { useState, useEffect, useRef } from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import './App.css'

// ICONS
const IconHome = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconApp = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IconSettings = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconLofi = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;

const tracks = [
  { title: "Night Train", src: "/music/track1.mp3" },
  { title: "Cyber Rain", src: "/music/track2.mp3" },
  { title: "Deep Space", src: "/music/track3.mp3" }
];

const t = {
  en: { welcome: "Welcome!", sub: "Estimate profits instantly.", calc:"Calc", flip:"Flip", buy:"Buy", sell:"Sell", fee:"Fee", set:"Settings", news:"News" },
  ru: { welcome: "Привет!", sub: "Считай профит моментально.", calc:"Кальк", flip:"Флип", buy:"Покупка", sell:"Продажа", fee:"Комисс.", set:"Настройки", news:"Новости" }
}

function App() {
  const [activeTab, setActiveTab] = useState('home'); // home | app | settings | lofi
  const [appMode, setAppMode] = useState('calc');
  const [lang, setLang] = useState('en');
  const [tonPrice, setTonPrice] = useState('6.50');
  
  // STATES
  const [display, setDisplay] = useState('0');
  const [buy, setBuy] = useState('');
  const [sell, setSell] = useState('');
  const [customFee, setCustomFee] = useState('');
  
  // LOFI
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    // Init TG
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#001a33');
      if (window.Telegram.WebApp.initDataUnsafe?.user?.language_code === 'ru') setLang('ru');
    }
    // Fetch Price
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r=>r.json()).then(d=>setTonPrice(parseFloat(d.price).toFixed(2))).catch(()=>{});
  }, []);

  // CALC
  const num = (n) => { if(display.length<9) setDisplay(display==='0'?String(n):display+n); }
  const reset = () => setDisplay('0');
  const solve = () => { try { setDisplay(String(eval(display.replace('x','*'))).slice(0,9)); } catch {} }

  // FLIP
  const getProfit = () => {
    const b = parseFloat(buy), s = parseFloat(sell);
    if(!b || !s) return null;
    const fee = parseFloat(customFee) || 10; // Default 10% (5 marketplace + 5 royalty)
    return (s * (1 - fee/100) - b).toFixed(2);
  }
  const profit = getProfit();
  const profitColor = profit >= 0 ? 'green' : 'red';

  // LOFI
  const togglePlay = () => {
    if(isPlaying) audioRef.current.pause(); else audioRef.current.play();
    setIsPlaying(!isPlaying);
  }

  // --- RENDER CONTENT ---
  const renderContent = () => {
    // 1. LOFI MODE
    if (activeTab === 'lofi') {
      return (
        <div className="lofi-view fade-in">
          <video src="/video/lofi-train.mp4" className="lofi-video" autoPlay loop muted playsInline />
          <div className="lofi-content">
             <div className="playlist">
                <div style={{color:'#fff', fontWeight:800, marginBottom:10}}>TONUSIC VIBE</div>
                {tracks.map((tr, i) => (
                  <div key={i} className={`track-row ${i===trackIdx?'active':''}`} 
                       onClick={()=>{setTrackIdx(i); setIsPlaying(true); setTimeout(()=>audioRef.current.play(),100)}}>
                    {i+1}. {tr.title}
                  </div>
                ))}
             </div>
             <div className="player-ctrls">
                <div className="play-circle" onClick={togglePlay}>
                   {isPlaying ? '⏸' : '▶️'}
                </div>
             </div>
             <audio ref={audioRef} src={tracks[trackIdx].src} loop />
          </div>
        </div>
      )
    }

    // 2. HOME
    if (activeTab === 'home') {
      return (
        <div className="page-transition">
           <div className="mascot-zone">
              <div className="neon-circle"></div>
              <img src="/img/chibi-happy.png" className="mascot-img" />
           </div>
           <div className="welcome-title">{t[lang].welcome}</div>
           <div className="welcome-text">{t[lang].sub}</div>
           
           <div className="widgets-grid">
              <div className="widget-card" onClick={()=>setActiveTab('lofi')}>
                 <video src="/video/banner-tonusic.mp4" className="widget-video" autoPlay loop muted playsInline />
                 <div className="widget-overlay">
                    <div className="widget-title">RELAX</div>
                    <div className="widget-sub">TONUSIC</div>
                 </div>
              </div>
              <div className="widget-card">
                 <video src="/video/banner-matrix.mp4" className="widget-video" autoPlay loop muted playsInline />
                 <div className="widget-overlay">
                    <div className="widget-title">THEME</div>
                    <div className="widget-sub">MATRIX</div>
                 </div>
              </div>
           </div>
        </div>
      )
    }

    // 3. APP (CALC/FLIP)
    if (activeTab === 'app') {
      return (
        <div className="page-transition">
           <div className="ton-badge" style={{marginBottom:10}}>💎 ${tonPrice}</div>
           <div className="switcher">
              <button className={`switch-btn ${appMode==='calc'?'active':''}`} onClick={()=>setAppMode('calc')}>{t[lang].calc}</button>
              <button className={`switch-btn ${appMode==='flip'?'active':''}`} onClick={()=>setAppMode('flip')}>{t[lang].flip}</button>
           </div>

           {appMode === 'calc' ? (
             <>
               <div className="screen">{display}</div>
               <div className="keypad">
                 <button className="btn clean-btn" onClick={reset}>AC</button>
                 <button className="btn" onClick={()=>setDisplay(display.slice(0,-1))}>⌫</button>
                 <button className="btn" onClick={()=>setDisplay(display+'%')}>%</button>
                 <button className="btn op-btn" onClick={()=>setDisplay(display+'/')}>÷</button>
                 <button className="btn" onClick={()=>num(7)}>7</button>
                 <button className="btn" onClick={()=>num(8)}>8</button>
                 <button className="btn" onClick={()=>num(9)}>9</button>
                 <button className="btn op-btn" onClick={()=>setDisplay(display+'*')}>×</button>
                 <button className="btn" onClick={()=>num(4)}>4</button>
                 <button className="btn" onClick={()=>num(5)}>5</button>
                 <button className="btn" onClick={()=>num(6)}>6</button>
                 <button className="btn op-btn" onClick={()=>setDisplay(display+'-')}>−</button>
                 <button className="btn" onClick={()=>num(1)}>1</button>
                 <button className="btn" onClick={()=>num(2)}>2</button>
                 <button className="btn" onClick={()=>num(3)}>3</button>
                 <button className="btn op-btn" onClick={()=>setDisplay(display+'+')}>+</button>
                 <button className="btn zero-btn" onClick={()=>num(0)}>0</button>
                 <button className="btn" onClick={()=>setDisplay(display+'.')}>.</button>
                 <button className="btn neon-btn" onClick={solve}>=</button>
               </div>
             </>
           ) : (
             <div style={{width:'100%', display:'flex', flexDirection:'column', gap:10}}>
               <input className="glass-input" type="number" placeholder={t[lang].buy} value={buy} onChange={e=>setBuy(e.target.value)} />
               <input className="glass-input" type="number" placeholder={t[lang].sell} value={sell} onChange={e=>setSell(e.target.value)} />
               <input className="glass-input" type="number" placeholder={`${t[lang].fee} %`} value={customFee} onChange={e=>setCustomFee(e.target.value)} />
               
               {profit && (
                 <div className="result-card">
                    <div style={{fontSize:12, color:'#888'}}>Net Profit</div>
                    <div style={{fontSize:28, fontWeight:800, color:profit>=0?'#32d74b':'#ff453a'}}>
                      {profit} TON
                    </div>
                    <div className="mascot-zone" style={{height:100, marginTop:10}}>
                       <div className={`neon-circle ${profitColor}`} style={{width:80, height:80}}></div>
                       <img src={profit>=0?"/img/chibi-happy.png":"/img/chibi-sad.png"} style={{width:100, zIndex:2}} />
                    </div>
                 </div>
               )}
             </div>
           )}
        </div>
      )
    }

    // 4. SETTINGS
    if (activeTab === 'settings') {
      return (
        <div className="page-transition" style={{width:'100%'}}>
           <h2 style={{color:'#fff', textAlign:'center'}}>{t[lang].set}</h2>
           <div style={{display:'flex', justifyContent:'center', marginBottom:20}}>
              <TonConnectButton />
           </div>
           <div className="setting-row" onClick={()=>setLang(lang==='en'?'ru':'en')}>
              <span>🌐 {t[lang].lang}</span>
              <span style={{opacity:0.6}}>{lang.toUpperCase()}</span>
           </div>
           <div className="setting-row" onClick={()=>window.open('https://t.me/mytoncalculator')}>
              <span>📢 {t[lang].news}</span>
              <span>↗</span>
           </div>
        </div>
      )
    }
  }

  return (
    <div className="super-island">
       <div className="ambient-wrapper">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="snow-container">
             {snowflakes.map((s,i)=>(<div key={i} className="snowflake" style={{left:s.left, animationDuration:s.dur, animationDelay:s.delay}}>❄</div>))}
          </div>
       </div>

       <div className="app-content">
          {renderContent()}
       </div>

       <div className="internal-nav">
          <div className={`nav-item ${activeTab==='settings'?'active':''}`} onClick={()=>setActiveTab('settings')}>
             <IconSettings/>
          </div>
          <div className="center-nav-btn" onClick={()=>setActiveTab('home')}>
             <IconHome/>
          </div>
          <div className={`nav-item ${activeTab==='app'?'active':''}`} onClick={()=>setActiveTab('app')}>
             <IconApp/>
          </div>
       </div>
    </div>
  )
}

export default App