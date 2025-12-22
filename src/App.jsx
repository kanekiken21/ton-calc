import { useState, useEffect, useRef } from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import './App.css'

// ICONS
const IconHome = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconApp = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IconSettings = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

const tracks = [
  { title: "Night Train", src: "/music/track1.mp3" },
  { title: "Cyber Rain", src: "/music/track2.mp3" }
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [appMode, setAppMode] = useState('calc');
  const [tonPrice, setTonPrice] = useState('6.50');
  
  // Calc
  const [display, setDisplay] = useState('0');
  
  // Flip
  const [buy, setBuy] = useState('');
  const [sell, setSell] = useState('');
  
  // Lofi
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const num = (n) => { if(display.length<9) setDisplay(display==='0'?String(n):display+n); }
  const reset = () => setDisplay('0');
  const solve = () => { try { setDisplay(String(eval(display.replace('x','*'))).slice(0,9)); } catch {} }

  const profit = buy && sell ? (sell * 0.9 - buy).toFixed(2) : null;

  const togglePlay = () => {
    if(isPlaying) audioRef.current.pause(); else audioRef.current.play();
    setIsPlaying(!isPlaying);
  }

  return (
    <div className="super-island">
       {/* ФОНОВЫЕ ЭЛЕМЕНТЫ */}
       <div className="orb orb-1"></div>
       <div className="orb orb-2"></div>

       {/* --- КОНТЕНТ --- */}
       <div className="app-content">
          
          {/* HOME */}
          {activeTab === 'home' && (
            <div className="fade-in">
               <div className="mascot-display">
                  <div className="mascot-glow"></div>
                  <img src="/img/chibi-happy.png" className="mascot-img" />
               </div>
               <h2 style={{margin:0, marginBottom:5}}>Welcome!</h2>
               <p style={{margin:0, opacity:0.6, fontSize:14, textAlign:'center'}}>Your ultimate TON tool.</p>
               
               <div className="banners-grid">
                  <div className="banner-widget" onClick={()=>setActiveTab('lofi')}>
                     <video src="/video/banner-tonusic.mp4" className="banner-video" autoPlay loop muted playsInline />
                     <div className="banner-overlay"><div className="banner-title">Relax</div><div className="banner-sub">TONUSIC</div></div>
                  </div>
                  <div className="banner-widget">
                     <video src="/video/banner-matrix.mp4" className="banner-video" autoPlay loop muted playsInline />
                     <div className="banner-overlay"><div className="banner-title">Theme</div><div className="banner-sub">MATRIX</div></div>
                  </div>
               </div>
            </div>
          )}

          {/* APP (CALC/FLIP) */}
          {activeTab === 'app' && (
            <div className="fade-in" style={{width:'100%'}}>
               <div style={{display:'flex', gap:10, marginBottom:15}}>
                  <button className="btn" style={{flex:1, background: appMode==='calc'?'rgba(255,255,255,0.15)':'transparent'}} onClick={()=>setAppMode('calc')}>Calc</button>
                  <button className="btn" style={{flex:1, background: appMode==='flip'?'rgba(255,255,255,0.15)':'transparent'}} onClick={()=>setAppMode('flip')}>Flip</button>
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
                 <div className="flip-cont">
                    <input className="glass-input" type="number" placeholder="Buy Price" value={buy} onChange={e=>setBuy(e.target.value)} />
                    <input className="glass-input" type="number" placeholder="Sell Price" value={sell} onChange={e=>setSell(e.target.value)} />
                    {profit && (
                      <div className="result-card">
                         <div style={{fontSize:12, opacity:0.6}}>Net Profit</div>
                         <div style={{fontSize:28, fontWeight:800, color:profit>=0?'#32d74b':'#ff453a'}}>{profit} TON</div>
                      </div>
                    )}
                 </div>
               )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="settings-list fade-in">
               <h2 style={{textAlign:'center'}}>Settings</h2>
               <div style={{display:'flex', justifyContent:'center', marginBottom:20}}>
                  <TonConnectButton />
               </div>
               <div className="setting-item">
                  <span>Language</span>
                  <span>EN</span>
               </div>
            </div>
          )}

          {/* LOFI OVERLAY */}
          {activeTab === 'lofi' && (
            <div className="lofi-view fade-in">
               <button className="close-lofi" onClick={()=>{setActiveTab('home'); audioRef.current.pause(); setIsPlaying(false)}}>✕</button>
               <video src="/video/lofi-train.mp4" className="lofi-video" autoPlay loop muted playsInline />
               <div className="lofi-content">
                  <h2>Night Train</h2>
                  <button className="play-btn" onClick={togglePlay}>{isPlaying?'⏸':'▶'}</button>
                  <audio ref={audioRef} src={tracks[0].src} loop />
               </div>
            </div>
          )}

       </div>

       {/* --- НАВИГАЦИЯ --- */}
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