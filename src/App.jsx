import { useState, useEffect, useRef } from 'react'
import { TonConnectButton } from '@tonconnect/ui-react'
import './App.css'

// ICONS
const IconHome = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconApp = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IconSet = () => <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

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
  const [fee, setFee] = useState('');
  
  // Lofi
  const [isLofi, setIsLofi] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000c1a');
    }
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r=>r.json()).then(d=>setTonPrice(parseFloat(d.price).toFixed(2))).catch(()=>{});
  }, []);

  const num = (n) => { if(display.length<9) setDisplay(display==='0'?String(n):display+n); }
  const reset = () => setDisplay('0');
  const solve = () => { try { setDisplay(String(eval(display.replace('x','*'))).slice(0,9)); } catch {} }

  const profit = buy && sell ? (sell * (1 - (parseFloat(fee)||10)/100) - buy).toFixed(2) : null;

  return (
    <div className="mobile-frame">
       <div className="ambient-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="snow-container">
             {Array.from({length:30}).map((_,i)=><div key={i} className="snowflake" style={{left:Math.random()*100+'%', animationDuration:Math.random()*5+5+'s'}}>❄</div>)}
          </div>
       </div>

       {/* CONTENT SCROLLABLE */}
       <div className={`scroll-content ${activeTab==='home'?'centered':''}`}>
          
          {/* HOME */}
          {activeTab === 'home' && (
            <div className="fade-in">
               <div className="mascot-wrap">
                  <div className="neon-circle"></div>
                  <img src="/img/chibi-happy.png" className="mascot-img" />
               </div>
               <h1 className="h1-title">Welcome!</h1>
               <p className="sub-text">Your ultimate TON tool.</p>
               
               <div className="banners-row">
                  <div className="banner-card" onClick={()=>setIsLofi(true)}>
                     <video src="/video/banner-tonusic.mp4" className="banner-vid" autoPlay loop muted playsInline />
                     <div className="banner-info"><div className="b-tag">Relax</div><div className="b-title">TONUSIC</div></div>
                  </div>
                  <div className="banner-card">
                     <video src="/video/banner-matrix.mp4" className="banner-vid" autoPlay loop muted playsInline />
                     <div className="banner-info"><div className="b-tag">Theme</div><div className="b-title">MATRIX</div></div>
                  </div>
               </div>

               <button className="lofi-btn-big" onClick={()=>setIsLofi(true)}>🎧 Lofi Radio</button>
            </div>
          )}

          {/* APP */}
          {activeTab === 'app' && (
            <div className="fade-in" style={{width:'100%'}}>
               <div className="tools-head">
                  <div className="ton-price-pill">💎 TON: ${tonPrice}</div>
                  <div className="switcher">
                     <button className={`switch-item ${appMode==='calc'?'active':''}`} onClick={()=>setAppMode('calc')}>Calculator</button>
                     <button className={`switch-item ${appMode==='flip'?'active':''}`} onClick={()=>setAppMode('flip')}>Flip NFT</button>
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
                    <div className="inp-row">
                       <input className="glass-inp" type="number" placeholder="Buy Price (TON)" value={buy} onChange={e=>setBuy(e.target.value)} />
                    </div>
                    <div className="inp-row">
                       <input className="glass-inp" type="number" placeholder="Sell Price (TON)" value={sell} onChange={e=>setSell(e.target.value)} />
                    </div>
                    <div className="inp-row">
                       <input className="glass-inp" type="number" placeholder="Fee % (Default 10)" value={fee} onChange={e=>setFee(e.target.value)} />
                    </div>
                    {profit && (
                      <div className="res-box">
                         <div style={{fontSize:12, opacity:0.6}}>Net Profit</div>
                         <div className="res-val" style={{color:profit>=0?'#32d74b':'#ff453a'}}>{profit} TON</div>
                         <div className="mascot-wrap" style={{height:100, marginTop:10}}>
                            <div className={`neon-circle ${profit>=0?'green':'red'}`} style={{width:80, height:80}}></div>
                            <img src={profit>=0?"/img/chibi-happy.png":"/img/chibi-sad.png"} style={{width:90, zIndex:2}} />
                         </div>
                      </div>
                    )}
                 </div>
               )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
             <div className="fade-in" style={{width:'100%'}}>
                <h2 className="h1-title">Settings</h2>
                <div style={{display:'flex', justifyContent:'center', margin:'20px 0'}}>
                   <TonConnectButton />
                </div>
                <div style={{width:'100%', display:'flex', flexDirection:'column', gap:10}}>
                   <button className="k-btn" style={{fontSize:16, justifyContent:'space-between', padding:'0 20px'}}>
                      <span>Language</span> <span style={{opacity:0.5}}>EN</span>
                   </button>
                   <button className="k-btn" style={{fontSize:16, justifyContent:'space-between', padding:'0 20px'}}>
                      <span>News Channel</span> <span>↗</span>
                   </button>
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
               <h2 style={{color:'#fff', marginBottom:5}}>Night Train</h2>
               <p style={{color:'#aaa', margin:0}}>Lofi Tony Radio</p>
               <div className="play-circle" onClick={()=>{
                  if(playing) audioRef.current.pause(); else audioRef.current.play();
                  setPlaying(!playing);
               }}>
                  {playing ? '⏸' : '▶'}
               </div>
               <audio ref={audioRef} src={tracks[0].src} loop />
            </div>
         </div>
       )}

       {/* NAV BAR */}
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
  )
}

export default App