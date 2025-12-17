import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // --- STATES ---
  const [loading, setLoading] = useState(true) // Splash
  const [showGuide, setShowGuide] = useState(false) // Onboarding
  const [guideStep, setGuideStep] = useState(1)
  
  const [mode, setMode] = useState('calc') // 'calc' | 'flip'
  const [tonPrice, setTonPrice] = useState(6.0) // Дефолт, если нет инета

  // Calc States
  const [display, setDisplay] = useState('0')
  const [waitingForOperand, setWaiting] = useState(false)
  const [pendingOp, setPendingOp] = useState(null)
  const [savedVal, setSavedVal] = useState(null)

  // Flip States
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')
  const [profit, setProfit] = useState(null)

  // --- INIT ---
  useEffect(() => {
    // 1. Telegram Setup
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
    }

    // 2. Check First Visit
    const visited = localStorage.getItem('ton_calc_v3');
    if (!visited) setShowGuide(true);

    // 3. Splash Timer
    setTimeout(() => setLoading(false), 2500);

    // 4. Fetch Price
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json()).then(d => setTonPrice(parseFloat(d.price)))
      .catch(e => console.log('Price error', e));
  }, [])

  // --- LOGIC: FLIP ---
  const calculateFlip = () => {
    const b = parseFloat(buy);
    const s = parseFloat(sell);
    if (!b || !s) { setProfit(null); return; }

    // Формула: (Продажа - 5%) - Покупка
    const netSell = s * 0.95; 
    const p = netSell - b;
    setProfit(p);
  }

  // Auto-calculate on input
  useEffect(() => { calculateFlip() }, [buy, sell])

  // --- LOGIC: CALC ---
  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaiting(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + String(digit));
    }
  }

  const performOp = (nextOp) => {
    const inputValue = parseFloat(display);

    if (savedVal === null) {
      setSavedVal(inputValue);
    } else if (pendingOp) {
      const current = savedVal;
      const newValue = doMath(current, inputValue, pendingOp);
      setSavedVal(newValue);
      setDisplay(String(newValue).slice(0, 9));
    }

    setWaiting(true);
    setPendingOp(nextOp);
  }

  const doMath = (a, b, op) => {
    if (op === '/') return a / b;
    if (op === '*') return a * b;
    if (op === '+') return a + b;
    if (op === '-') return a - b;
    return b;
  }

  const reset = () => { setDisplay('0'); setSavedVal(null); setPendingOp(null); setWaiting(false); }
  const percent = () => setDisplay(String(parseFloat(display) / 100));
  const invert = () => setDisplay(String(parseFloat(display) * -1));

  // --- RENDER HELPERS ---
  const finishGuide = () => {
    localStorage.setItem('ton_calc_v3', 'true');
    setShowGuide(false);
  }

  return (
    <>
      <div className="aurora-bg">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>

      {/* SPLASH */}
      {loading && (
        <div className="splash">
          <div className="splash-logo">💎</div>
          <div className="splash-text">TON CALCULATOR</div>
        </div>
      )}

      {/* GUIDE */}
      {!loading && showGuide && (
        <div className="guide-overlay">
          <div className="guide-card">
            <div className="guide-emoji">{guideStep === 1 ? '⚡️' : '💎'}</div>
            <div className="guide-h">{guideStep === 1 ? 'Привет!' : 'Flip Mode'}</div>
            <div className="guide-p">
              {guideStep === 1 
                ? 'Лучший калькулятор для TON трейдера. Простой, быстрый, красивый.' 
                : 'Считай чистую прибыль с NFT мгновенно. Мы сами вычтем комиссию.'}
            </div>
            
            <div className="guide-dots">
              <div className={`dot ${guideStep===1?'active':''}`}></div>
              <div className={`dot ${guideStep===2?'active':''}`}></div>
            </div>

            <button className="btn submit" style={{width:'100%', borderRadius:'20px', fontSize:'18px'}} 
              onClick={() => guideStep === 1 ? setGuideStep(2) : finishGuide()}>
              {guideStep === 1 ? 'Далее' : 'Начать'}
            </button>
          </div>
        </div>
      )}

      {/* APP */}
      {!loading && (
        <div className="app-container">
          
          {/* TOGGLE */}
          <div className="toggle-container">
            <div className="toggle-glass">
              <div className="toggle-slider" style={{transform: mode==='calc' ? 'translateX(0)' : 'translateX(100%)'}}></div>
              <button className={`toggle-btn ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>Calc</button>
              <button className={`toggle-btn ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>Flip</button>
            </div>
          </div>

          {/* MODE: CALC */}
          {mode === 'calc' && (
            <div className="calc-wrapper" style={{animation: 'slideIn 0.3s ease'}}>
              <div className="display-area">
                <div className="main-display">{display}</div>
              </div>
              <div className="keypad">
                <button className="btn" onClick={reset}>AC</button>
                <button className="btn" onClick={invert}>+/-</button>
                <button className="btn" onClick={percent}>%</button>
                <button className="btn action" onClick={()=>performOp('/')}>÷</button>
                
                <button className="btn" onClick={()=>inputDigit(7)}>7</button>
                <button className="btn" onClick={()=>inputDigit(8)}>8</button>
                <button className="btn" onClick={()=>inputDigit(9)}>9</button>
                <button className="btn action" onClick={()=>performOp('*')}>×</button>
                
                <button className="btn" onClick={()=>inputDigit(4)}>4</button>
                <button className="btn" onClick={()=>inputDigit(5)}>5</button>
                <button className="btn" onClick={()=>inputDigit(6)}>6</button>
                <button className="btn action" onClick={()=>performOp('-')}>−</button>
                
                <button className="btn" onClick={()=>inputDigit(1)}>1</button>
                <button className="btn" onClick={()=>inputDigit(2)}>2</button>
                <button className="btn" onClick={()=>inputDigit(3)}>3</button>
                <button className="btn action" onClick={()=>performOp('+')}>+</button>
                
                <button className="btn zero" onClick={()=>inputDigit(0)}>0</button>
                <button className="btn" onClick={()=>{if(!display.includes('.'))setDisplay(display+'.')}}>.</button>
                <button className="btn submit" onClick={()=>performOp('=')}>=</button>
              </div>
            </div>
          )}

          {/* MODE: FLIP */}
          {mode === 'flip' && (
            <div className="flip-wrapper" style={{animation: 'slideIn 0.3s ease'}}>
              <div className="glass-panel">
                <div className="input-block">
                  <div className="label">Купил (TON)</div>
                  <input type="number" className="glass-input" placeholder="0" 
                    value={buy} onChange={e => setBuy(e.target.value)} />
                </div>
                
                <div className="input-block">
                  <div className="label">Продал (TON)</div>
                  <input type="number" className="glass-input" placeholder="0" 
                    value={sell} onChange={e => setSell(e.target.value)} />
                </div>

                {profit !== null && (
                  <div className="result-card">
                    <div className="res-val" style={{color: profit >= 0 ? '#32d74b' : '#ff453a'}}>
                      {profit > 0 ? '+' : ''}{profit.toFixed(2)}
                    </div>
                    <div className="res-sub">TON PROFIT</div>
                    <div style={{color:'white', marginTop:'10px', fontWeight:'600'}}>
                      ≈ ${(profit * tonPrice).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </>
  )
}

export default App