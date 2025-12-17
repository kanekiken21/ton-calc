import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // --- STATE ---
  const [mode, setMode] = useState('calc') // 'calc' or 'flip'
  const [showGuide, setShowGuide] = useState(false)
  const [tonPrice, setTonPrice] = useState(null)

  // Calc Logic State
  const [display, setDisplay] = useState('0')
  const [waiting, setWaiting] = useState(false) // Ждем ли вторую цифру
  const [op, setOp] = useState(null)
  const [memory, setMemory] = useState(null)

  // Flip Logic State
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')

  // --- INIT ---
  useEffect(() => {
    // Настройка Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
    }

    // Проверка первого входа (Гайд)
    const visited = localStorage.getItem('ton_calc_visited');
    if (!visited) setShowGuide(true);

    // Загрузка курса
    fetchPrice();
  }, [])

  const fetchPrice = () => {
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(r => r.json())
      .then(d => setTonPrice(parseFloat(d.price).toFixed(2)))
      .catch(() => setTonPrice('6.25')); // Если инет упал
  }

  // --- CALC FUNCTIONS ---
  const num = (n) => {
    if (waiting) {
      setDisplay(String(n));
      setWaiting(false);
    } else {
      setDisplay(display === '0' ? String(n) : display + String(n));
    }
  }

  const operator = (nextOp) => {
    const inputValue = parseFloat(display);
    
    if (memory === null) {
      setMemory(inputValue);
    } else if (op) {
      const result = calculate(memory, inputValue, op);
      setDisplay(String(result).slice(0, 10)); // Обрезаем длинные хвосты
      setMemory(result);
    }

    setWaiting(true);
    setOp(nextOp);
  }

  const calculate = (a, b, operation) => {
    if (operation === '+') return a + b;
    if (operation === '-') return a - b;
    if (operation === 'x') return a * b;
    if (operation === '/') return a / b;
    return b;
  }

  const reset = () => { setDisplay('0'); setMemory(null); setOp(null); setWaiting(false); }
  const percent = () => setDisplay(String(parseFloat(display) / 100));
  const invert = () => setDisplay(String(parseFloat(display) * -1));

  // --- FLIP LOGIC ---
  const getProfit = () => {
    const b = parseFloat(buy);
    const s = parseFloat(sell);
    if (!b || !s) return null;
    
    // Формула: Продажа * 0.9 (10% комиссия: 5% сервис + 5% роялти) - Покупка
    // Или сделаем 5% сервис + 5% роялти = 10%
    const fees = s * 0.10; 
    return (s - fees - b).toFixed(2);
  }
  const profit = getProfit();

  // --- RENDER ---
  return (
    <>
      <div className="background"></div>

      {/* ГАЙД ПРИ ПЕРВОМ ВХОДЕ */}
      {showGuide && (
        <div className="guide-overlay">
          <div className="guide-card">
            <div className="guide-icon">👋</div>
            <div className="guide-title">Привет!</div>
            <div className="guide-text">
              Это твой новый инструмент.<br/><br/>
              <b>Calc</b> — удобный калькулятор.<br/>
              <b>Flip</b> — расчет прибыли с NFT.<br/>
            </div>
            <button className="guide-btn" onClick={() => {
              localStorage.setItem('ton_calc_visited', 'true');
              setShowGuide(false);
            }}>Понятно</button>
          </div>
        </div>
      )}

      <div className="app-header">
        <div className="ton-price" onClick={fetchPrice}>
          💎 1 TON ≈ ${tonPrice || '...'} 🔄
        </div>
        
        {/* ПЕРЕКЛЮЧАТЕЛЬ */}
        <div className="segmented-control">
          <button className={`segment-btn ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>Calc</button>
          <button className={`segment-btn ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>Flip</button>
        </div>
      </div>

      <div className="content">
        {/* РЕЖИМ: КАЛЬКУЛЯТОР */}
        {mode === 'calc' && (
          <div style={{animation: 'fadeIn 0.3s'}}>
            <div className="calc-display">{display}</div>
            <div className="calc-grid">
              <button className="btn gray" onClick={reset}>AC</button>
              <button className="btn gray" onClick={invert}>+/-</button>
              <button className="btn gray" onClick={percent}>%</button>
              <button className="btn orange" onClick={()=>operator('/')}>÷</button>
              
              <button className="btn" onClick={()=>num(7)}>7</button>
              <button className="btn" onClick={()=>num(8)}>8</button>
              <button className="btn" onClick={()=>num(9)}>9</button>
              <button className="btn orange" onClick={()=>operator('x')}>×</button>
              
              <button className="btn" onClick={()=>num(4)}>4</button>
              <button className="btn" onClick={()=>num(5)}>5</button>
              <button className="btn" onClick={()=>num(6)}>6</button>
              <button className="btn orange" onClick={()=>operator('-')}>−</button>
              
              <button className="btn" onClick={()=>num(1)}>1</button>
              <button className="btn" onClick={()=>num(2)}>2</button>
              <button className="btn" onClick={()=>num(3)}>3</button>
              <button className="btn orange" onClick={()=>operator('+')}>+</button>
              
              <button className="btn zero" onClick={()=>num(0)}>0</button>
              <button className="btn" onClick={()=>{if(!display.includes('.'))setDisplay(display+'.')}}>,</button>
              <button className="btn orange" onClick={()=>operator('=')}>=</button>
            </div>
          </div>
        )}

        {/* РЕЖИМ: FLIP */}
        {mode === 'flip' && (
          <div className="flip-card">
            <div className="input-label">Цена покупки (TON)</div>
            <input type="number" className="input-field" placeholder="0" 
                   value={buy} onChange={e=>setBuy(e.target.value)}/>
            
            <div className="input-label" style={{marginTop:'15px'}}>Цена продажи (TON)</div>
            <input type="number" className="input-field" placeholder="0" 
                   value={sell} onChange={e=>setSell(e.target.value)}/>

            {profit !== null && (
              <div className="profit-info">
                <div style={{fontSize:'12px', color:'#888', marginBottom:'5px'}}>Твой чистый профит:</div>
                <div className="profit-val" style={{color: parseFloat(profit)>=0?'#32d74b':'#ff453a'}}>
                  {parseFloat(profit)>0?'+':''}{profit} TON
                </div>
                {tonPrice && <div className="profit-usd">≈ ${(parseFloat(profit)*tonPrice).toFixed(2)}</div>}
                
                <div className="profit-desc">
                  * Расчет включает 5% комиссию Getgems и 5% авторских отчислений (Royalty). Итого вычитается 10%.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default App