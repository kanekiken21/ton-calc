import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // --- STATES ---
  const [loading, setLoading] = useState(true)
  const [onboardingStep, setOnboardingStep] = useState(0) // 0 = нет, 1-3 = шаги
  const [tab, setTab] = useState('flip') // Текущая вкладка
  const [showPrivacy, setShowPrivacy] = useState(false)
  
  // Data States
  const [tonPrice, setTonPrice] = useState(null)
  
  // Flip
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')
  const [royalty, setRoyalty] = useState('')
  const [profit, setProfit] = useState(null)
  
  // Gifts
  const [giftQ, setGiftQ] = useState('')
  
  // Stars
  const [stars, setStars] = useState('')
  const [starsRes, setStarsRes] = useState(null)

  // Calc
  const [calc, setCalc] = useState('0')
  const [waitSec, setWaitSec] = useState(false)
  const [fNum, setFNum] = useState(null)
  const [op, setOp] = useState(null)

  // --- INIT ---
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
    }
    
    // Проверка первого входа
    const visited = localStorage.getItem('v2_visit');
    if (!visited) setOnboardingStep(1);
    
    setTimeout(() => setLoading(false), 2500);
    fetchPrice();
  }, [])

  const fetchPrice = () => {
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.20')); // Фолбек
  }

  // --- LOGIC ---
  const doFlip = () => {
    const b = parseFloat(buy) || 0; const s = parseFloat(sell) || 0;
    const r = royalty ? parseFloat(royalty) : 5;
    const fee = s * ((5 + r) / 100);
    setProfit((s - fee - b).toFixed(2));
  }

  const doStars = () => {
    const s = parseFloat(stars) || 0;
    setStarsRes((s * 0.0135).toFixed(2)); // Курс вывода
  }

  const openSupport = () => window.open('https://t.me/euharbar', '_blank');

  const searchGift = () => {
    if(!giftQ) return;
    // Умный поиск: если ввели "Pepe", ищем по атрибутам, иначе просто текст
    const q = encodeURIComponent(giftQ);
    window.open(`https://getgems.io/collection/EQDnwd-3r6p_jJaO7beD_S_mS2AH65MZ7b1h1N3U7W_4r6p?search=${q}`, '_blank');
  }

  // Calc Logic
  const num = (n) => {
    if(waitSec) { setCalc(String(n)); setWaitSec(false); }
    else setCalc(calc === '0' ? String(n) : calc + n);
  }
  const oper = (o) => {
    const inp = parseFloat(calc);
    if(fNum === null) setFNum(inp);
    else if(op) {
      const res = calcRes(fNum, inp, op);
      setCalc(String(res).slice(0, 9)); setFNum(res);
    }
    setWaitSec(true); setOp(o);
  }
  const calcRes = (a, b, o) => {
    if(o==='+') return a+b; if(o==='-') return a-b;
    if(o==='*') return a*b; if(o==='/') return a/b; return b;
  }

  // --- RENDER HELPERS ---
  const finishOnboarding = () => {
    localStorage.setItem('v2_visit', 'true');
    setOnboardingStep(0);
  }

  return (
    <>
      <div className="background-fx"></div>

      {/* SPLASH */}
      {loading && (
        <div className="splash-screen">
          <div className="splash-logo">💎</div>
          <div className="splash-title">my TON Calculator</div>
        </div>
      )}

      {/* ONBOARDING */}
      {!loading && onboardingStep > 0 && (
        <div className="onboarding">
          {onboardingStep === 1 && (
            <div className="guide-step">
              <div className="guide-icon">👋</div>
              <div className="guide-title">Привет!</div>
              <div className="guide-text">Это твой личный инструмент для заработка в TON.</div>
              <button className="main-btn" onClick={() => setOnboardingStep(2)}>Далее</button>
            </div>
          )}
          {onboardingStep === 2 && (
            <div className="guide-step">
              <div className="guide-icon">🚀</div>
              <div className="guide-title">Всё под рукой</div>
              <div className="guide-text">Считай профит с перепродажи NFT (Flip) и выводи Звезды выгодно.</div>
              <button className="main-btn" onClick={() => setOnboardingStep(3)}>Далее</button>
            </div>
          )}
          {onboardingStep === 3 && (
            <div className="guide-step">
              <div className="guide-icon">🎁</div>
              <div className="guide-title">Гифты и Курс</div>
              <div className="guide-text">Следи за ценой TON и ищи редкие подарки.</div>
              <button className="main-btn" onClick={finishOnboarding}>Начать!</button>
            </div>
          )}
        </div>
      )}

      {/* PRIVACY MODAL */}
      {showPrivacy && (
        <div className="modal" onClick={() => setShowPrivacy(false)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <h2>Privacy Policy</h2>
            <p>1. Мы не храним ваши данные.<br/>2. Все расчеты происходят на вашем устройстве.<br/>3. Мы используем публичные API (Binance) для получения курса.<br/><br/>Contact: @euharbar</p>
            <button className="main-btn" style={{padding:'10px', marginTop:'10px'}} onClick={() => setShowPrivacy(false)}>Close</button>
          </div>
        </div>
      )}

      {/* MAIN APP */}
      {!loading && (
        <div className="app-content">
          
          {/* HEADER */}
          <div className="header">
            <div className="header-title">
              💎 {tonPrice ? `$${tonPrice}` : '...'}
            </div>
            <div style={{display:'flex', gap:'10px'}}>
               <button className="header-btn" onClick={() => setShowPrivacy(true)}>🛡️</button>
               <button className="header-btn" onClick={openSupport}>💬</button>
            </div>
          </div>

          {/* FLIP SCREEN */}
          {tab === 'flip' && (
            <div className="card">
              <h2 style={{marginTop:0}}>Flip Calculator ⚡️</h2>
              
              <div className="input-label">Купил за (TON)</div>
              <input type="number" className="input-field" value={buy} onChange={e=>setBuy(e.target.value)} placeholder="0" />
              
              <div style={{display:'flex', gap:'10px', marginTop:'15px'}}>
                <div style={{flex:1}}>
                   <div className="input-label">Продаю за</div>
                   <input type="number" className="input-field" value={sell} onChange={e=>setSell(e.target.value)} placeholder="0" />
                </div>
                <div style={{width:'35%'}}>
                   <div className="input-label" onClick={()=>alert('Комиссия автора (обычно 5%)')}>Royalty ⓘ</div>
                   <input type="number" className="input-field" value={royalty} onChange={e=>setRoyalty(e.target.value)} placeholder="5" style={{borderColor:'#007aff'}}/>
                </div>
              </div>

              <button className="main-btn" onClick={doFlip}>Посчитать</button>

              {profit && (
                <div style={{marginTop:'20px', padding:'15px', background:'rgba(0,255,0,0.1)', borderRadius:'16px'}}>
                  <div style={{fontSize:'12px', color:'#aaa'}}>Чистая прибыль</div>
                  <div style={{fontSize:'32px', fontWeight:'bold', color:'#32d74b'}}>
                    {parseFloat(profit)>0?'+':''}{profit} TON
                  </div>
                  <div style={{color:'#888'}}>≈ ${(parseFloat(profit)*tonPrice).toFixed(2)}</div>
                </div>
              )}
            </div>
          )}

          {/* GIFTS SCREEN */}
          {tab === 'gifts' && (
            <div className="card">
              <h2 style={{marginTop:0}}>Gifts Search 🎁</h2>
              <p style={{fontSize:'13px', color:'#aaa'}}>Ищи подарки на Getgems</p>
              
              <div className="input-label">Название</div>
              <input type="text" className="input-field" value={giftQ} onChange={e=>setGiftQ(e.target.value)} placeholder="Pepe, Star..." />
              
              <button className="main-btn" onClick={searchGift}>Найти на Getgems ↗</button>
              
              <div style={{marginTop:'20px', textAlign:'left', fontSize:'12px', color:'#666'}}>
                * Откроет маркетплейс с фильтром по вашему запросу.
              </div>
            </div>
          )}

          {/* STARS SCREEN */}
          {tab === 'stars' && (
            <div className="card">
              <h2 style={{marginTop:0}}>Stars Converter ⭐️</h2>
              <div className="input-label">Количество звезд</div>
              <input type="number" className="input-field" value={stars} onChange={e=>setStars(e.target.value)} placeholder="0" />
              <button className="main-btn" onClick={doStars}>Конвертировать</button>
              {starsRes && (
                <div style={{marginTop:'20px', fontSize:'30px', fontWeight:'bold', color:'#ffd700'}}>
                  ${starsRes}
                </div>
              )}
            </div>
          )}

          {/* CALCULATOR SCREEN */}
          {tab === 'calc' && (
            <div className="card" style={{padding:'20px'}}>
              <div className="calc-display">{calc}</div>
              <div className="calc-grid">
                <button className="calc-btn op" onClick={()=>setCalc('0')}>C</button>
                <button className="calc-btn op" onClick={()=>setCalc(String(parseFloat(calc)*-1))}>+/-</button>
                <button className="calc-btn op" onClick={()=>setCalc(String(parseFloat(calc)/100))}>%</button>
                <button className="calc-btn op" onClick={()=>oper('/')}>÷</button>
                
                <button className="calc-btn" onClick={()=>num(7)}>7</button>
                <button className="calc-btn" onClick={()=>num(8)}>8</button>
                <button className="calc-btn" onClick={()=>num(9)}>9</button>
                <button className="calc-btn op" onClick={()=>oper('*')}>×</button>
                
                <button className="calc-btn" onClick={()=>num(4)}>4</button>
                <button className="calc-btn" onClick={()=>num(5)}>5</button>
                <button className="calc-btn" onClick={()=>num(6)}>6</button>
                <button className="calc-btn op" onClick={()=>oper('-')}>−</button>
                
                <button className="calc-btn" onClick={()=>num(1)}>1</button>
                <button className="calc-btn" onClick={()=>num(2)}>2</button>
                <button className="calc-btn" onClick={()=>num(3)}>3</button>
                <button className="calc-btn op" onClick={()=>oper('+')}>+</button>
                
                <button className="calc-btn zero" onClick={()=>num(0)}>0</button>
                <button className="calc-btn" onClick={()=>{if(!calc.includes('.'))setCalc(calc+'.')}}>.</button>
                <button className="calc-btn eq" onClick={()=>oper('=')}>=</button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <div className="bottom-nav">
        <button className={`nav-item ${tab==='flip'?'active':''}`} onClick={()=>setTab('flip')}>
          <div className="nav-icon">⚡️</div>
          <div>Flip</div>
        </button>
        <button className={`nav-item ${tab==='gifts'?'active':''}`} onClick={()=>setTab('gifts')}>
          <div className="nav-icon">🎁</div>
          <div>Gifts</div>
        </button>
        <button className={`nav-item ${tab==='stars'?'active':''}`} onClick={()=>setTab('stars')}>
          <div className="nav-icon">⭐️</div>
          <div>Stars</div>
        </button>
        <button className={`nav-item ${tab==='calc'?'active':''}`} onClick={()=>setTab('calc')}>
          <div className="nav-icon">🔢</div>
          <div>Calc</div>
        </button>
      </div>
    </>
  )
}

export default App