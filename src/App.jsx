import { useState, useEffect, useRef } from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import './App.css'

// ИКОНКИ (Чистые, без фона)
const IconHome = () => <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>;
const IconApp = () => <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IconSet = () => <svg viewBox="0 0 24 24"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;

const tracks = [
  { title: "Vibe 1: Focus", src: "/music/track1.mp3" },
  { title: "Vibe 2: Night", src: "/music/track2.mp3" },
  { title: "Vibe 3: Dream", src: "/music/track3.mp3" }
];

const t = {
  en: { 
    welcome: "Welcome!", sub: "Your ultimate TON tool.", 
    nav_home: "Home", nav_app: "App", nav_set: "Settings",
    calc: "Calculator", flip: "Flip NFT", 
    buy: "Buy Price", sell: "Sell Price", fee: "Fee %",
    net: "Net Profit",
    sets: "Settings", news: "News", lang: "Language",
    relax: "RELAX", theme: "THEME", showUi: "Show Playlist"
  },
  ru: { 
    welcome: "Привет!", sub: "Твой главный инструмент.", 
    nav_home: "Главная", nav_app: "Утилиты", nav_set: "Настр.",
    calc: "Калькулятор", flip: "Флип NFT", 
    buy: "Покупка", sell: "Продажа", fee: "Комиссия %",
    net: "Профит",
    sets: "Настройки", news: "Новости", lang: "Язык",
    relax: "РЕЛАКС", theme: "ТЕМА", showUi: "Показать плейлист"
  }
}

function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [appMode, setAppMode] = useState('calc');
  const [lang, setLang] = useState('en');
  const [tonPrice, setTonPrice] = useState('...');
  const [snowflakes, setSnowflakes] = useState([]);
  
  const [display, setDisplay] = useState('0');
  const [buy, setBuy] = useState('');
  const [sell, setSell] = useState('');
  const [fee, setFee] = useState('');
  
  // LOFI
  const [isLofi, setIsLofi] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [hideUi, setHideUi] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2500);
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
      const userLang = window.Telegram.WebApp.initDataUnsafe?.user?.language_code;
      if (userLang === 'ru' || userLang === 'be' || userLang === 'uk') setLang('ru');
    }
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r=>r.json()).then(d=>setTonPrice(parseFloat(d.price).toFixed(2))).catch(()=>{});
    
    setSnowflakes(Array.from({length:40}).map((_,i)=>({
      id:i, left:Math.random()*100+'%', dur:Math.random()*5+5+'s', delay: -Math.random()*5+'s'
    })));
  }, []);

  const safeLink = (url) => window.Telegram?.WebApp ? window.Telegram.WebApp.openTelegramLink(url) : window.open(url, '_blank');
  const num = (n) => { if(display.length<9) setDisplay(display==='0'?String(n):display+n); }
  const reset = () => setDisplay('0');
  const solve = () => { try { setDisplay(String(eval(display.replace('x','*'))).slice(0,9)); } catch {} }
  const profit = buy && sell ? (sell * (1 - (parseFloat(fee)||10)/100) - buy).toFixed(2) : null;

  const togglePlay = () => { if(playing) audioRef.current.pause(); else audioRef.current.play(); setPlaying(!playing); }
  const changeTrack = (idx) => { setTrackIdx(idx); setPlaying(true); setTimeout(()=>audioRef.current.play(), 50); }

  return (
    <>
      <div className={`loading-screen ${!loading ? 'hidden' : ''}`}>
         <img src="/img/logo-v2.png" className="loader-logo" />
         <div className="loader-title">MY TON CALCULATOR</div>
         <div className="loader-spinner-main"></div>
      </div>

      <div className="mobile-frame">
         <div className="bg-grid"></div>
         <div className="ambient-bg">
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
            <div className="snow-container">
               {snowflakes.map(s=><div key={s.id} className="snowflake" style={{left:s.left, animationDuration:s.dur, animationDelay:s.delay}}>❄</div>)}
            </div>
         </div>

         <div className={`scroll-content ${activeTab==='home'?'centered':''}`}>
            
            {activeTab === 'home' && (
              <div className="page-anim">
                 <div className="mascot-wrap">
                    <div className="sparkle" style={{top:20, left:40}}></div>
                    <div className="neon-circle"></div>
                    <img src="/img/chibi-happy.png" className="mascot-img" />
                 </div>
                 <h1 className="h1-title">{t[lang].welcome}</h1>
                 <div className="beta-badge">v.1.0 BETA</div> {/* БЕЙДЖ БЕТА */}
                 <p className="sub-text">{t[lang].sub}</p>
                 
                 <div className="banners-label">{t[lang].explore}</div>
                 <div className="banners-row">
                    <div className="banner-card" onClick={()=>setIsLofi(true)}>
                       <video src="/video/banner-tonusic.mp4" className="banner-vid" autoPlay loop muted playsInline />
                       <div className="banner-info"><div className="b-tag">{t[lang].relax}</div><div className="b-title">TONUSIC</div></div>
                    </div>
                    <div className="banner-card" onClick={()=>safeLink('https://t.me/share/url?url=https://t.me/MyTonCalcBot')}>
                       <video src="/video/banner-matrix.mp4" className="banner-vid" autoPlay loop muted playsInline />
                       <div className="banner-info"><div className="b-tag">{t[lang].theme}</div><div className="b-title">MATRIX</div></div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'app' && (
              <div className="page-anim" style={{width:'100%'}}>
                 <div className="tools-head">
                    <div className="ton-pill"><span>💎</span> TON: ${tonPrice}</div>
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
                           <div className="mascot-wrap" style={{height:100, marginTop:15}}>
                              <div className={`neon-circle ${profit>=0?'green':'red'}`} style={{width:80, height:80}}></div>
                              <img src={profit>=0?"/img/chibi-happy.png":"/img/chibi-sad.png"} className="mascot-img" style={{width:90}} />
                           </div>
                        </div>
                      )}
                   </div>
                 )}
              </div>
            )}

            {activeTab === 'settings' && (
               <div className="page-anim" style={{width:'100%'}}>
                  <h2 className="h1-title" style={{marginBottom:25}}>{t[lang].sets}</h2>
                  <div style={{display:'flex', justifyContent:'center', marginBottom:25}}>
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
           <div className="lofi-wrapper">
              <div className="close-lofi" onClick={()=>{setIsLofi(false); setHideUi(false); if(playing) audioRef.current.pause(); setPlaying(false)}}>✕</div>
              
              {!videoLoaded && <div className="loader-spinner-main" style={{position:'absolute', zIndex:10}}></div>}
              
              <video 
                src="/video/lofi-train.mp4" className="lofi-vid" 
                autoPlay loop muted playsInline 
                onLoadedData={()=>setVideoLoaded(true)}
              />
              
              {hideUi && <div className="show-ui-btn" onClick={()=>setHideUi(false)}>{t[lang].showUi}</div>}

              <div className={`lofi-ui ${hideUi ? 'hidden-ui' : ''}`}>
                 <div className="slide-handle" onClick={()=>setHideUi(true)}></div>
                 <div className="playlist">
                    {tracks.map((tr, i) => (
                       <div key={i} className={`track-item ${trackIdx===i?'active':''}`} onClick={()=>changeTrack(i)}>
                          {i+1}. {tr.title}
                       </div>
                    ))}
                 </div>
                 <div className="lofi-controls">
                    <div className="play-btn" onClick={togglePlay}>{playing ? '⏸' : '▶'}</div>
                 </div>
                 <audio ref={audioRef} src={tracks[trackIdx].src} loop />
              </div>
           </div>
         )}

         {!isLofi && (
           <div className="nav-bar">
              <div className={`nav-btn ${activeTab==='settings'?'active':''}`} onClick={()=>setActiveTab('settings')}>
                 <IconSet/>
              </div>
              <div className="nav-center">
                 <div className="home-btn" onClick={()=>setActiveTab('home')}><IconHome/></div>
              </div>
              <div className={`nav-btn ${activeTab==='app'?'active':''}`} onClick={()=>setActiveTab('app')}>
                 <IconApp/>
              </div>
           </div>
         )}
      </div>
    </>
  )
}

export default App