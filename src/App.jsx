import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [mode, setMode] = useState('calc') // 'calc' или 'flip'
  
  // --- STATES FOR FLIP ---
  const [buy, setBuy] = useState('')
  const [sell, setSell] = useState('')
  const [prices, setPrices] = useState({ ton: 0, btc: 0, rub: 0 })

  // --- STATES FOR CALC ---
  const [display, setDisplay] = useState('0')
  const [waiting, setWaiting] = useState(false)
  const [prev, setPrev] = useState(null)
  const [op, setOp] = useState(null)

  // --- INIT ---
  useEffect(() => {
    // Настройка Телеграм окна
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.setHeaderColor('#000000');
    }
    fetchPrices();
  }, [])

  // Получаем курсы (TON->USD, TON->BTC, USD->RUB)
  const fetchPrices = async () => {
    try {
      // 1. TON цена
      const tonRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT');
      const tonData = await tonRes.json();
      const tonUsd = parseFloat(tonData.price);

      // 2. BTC цена
      const btcRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
      const btcData = await btcRes.json();
      const btcUsd = parseFloat(btcData.price);

      // 3. RUB (примерно)
      const rubRate = 100; // Можно подключить API, но для скорости пока хардкод или другой API

      setPrices({
        ton: tonUsd,
        btc: tonUsd / btcUsd, // Сколько BTC в 1 TON
        rub: tonUsd * rubRate
      });
    } catch (e) {
      console.error(e);
      setPrices({ ton: 6.2, btc: 0.00006, rub: 600 }); // Фолбек
    }
  }

  // --- LOGIC FLIP ---
  const getProfit = () => {
    const b = parseFloat(buy);
    const s = parseFloat(sell);
    if (!b || !s) return null;

    // Формула: (Продажа * 0.95) - Покупка
    // 0.95 это вычет 5% комиссии Getgems. Роялти опустили для простоты UI.
    const profitTON = (s * 0.95) - b;
    return profitTON;
  }

  const profit = getProfit();

  // --- LOGIC CALC ---
  const inputNum = (n) => {
    if (waiting) {
      setDisplay(String(n));
      setWaiting(false);
    } else {
      setDisplay(display === '0' ? String(n) : display + n);
    }
  }

  const inputOp = (oper) => {
    const current = parseFloat(display);
    if (prev === null) setPrev(current);
    else if (op) {
      const res = calc(prev, current, op);
      setDisplay(String(res).slice(0, 9));
      setPrev(res);
    }
    setWaiting(true);
    setOp(oper);
  }

  const calc = (a, b, o) => {
    if (o === '+') return a + b;
    if (o === '−') return a - b;
    if (o === '×') return a * b;
    if (o === '÷') return a / b;
    return b;
  }

  const reset = () => { setDisplay('0'); setPrev(null); setOp(null); setWaiting(false); }
  const percent = () => setDisplay(String(parseFloat(display)/100));
  const invert = () => setDisplay(String(parseFloat(display)*-1));

  return (
    <div className="container">
      
      {/* ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ (Сверху) */}
      <div className="header">
        <div className="switcher">
          <button className={`switch-btn ${mode==='calc'?'active':''}`} onClick={()=>setMode('calc')}>Calc</button>
          <button className={`switch-btn ${mode==='flip'?'active':''}`} onClick={()=>setMode('flip')}>Flip</button>
        </div>
      </div>

      {/* --- CALCULATOR MODE --- */}
      {mode === 'calc' && (
        <div className="fade-enter" style={{width:'100%', marginTop: 'auto'}}>
          <div className="calc-screen">{display}</div>
          <div className="calc-grid">
            <button className="btn gray" onClick={reset}>C</button>
            <button className="btn gray" onClick={invert}>+/-</button>
            <button className="btn gray" onClick={percent}>%</button>
            <button className="btn orange" onClick={()=>inputOp('÷')}>÷</button>
            
            <button className="btn" onClick={()=>inputNum(7)}>7</button>
            <button className="btn" onClick={()=>inputNum(8)}>8</button>
            <button className="btn" onClick={()=>inputNum(9)}>9</button>
            <button className="btn orange" onClick={()=>inputOp('×')}>×</button>
            
            <button className="btn" onClick={()=>inputNum(4)}>4</button>
            <button className="btn" onClick={()=>inputNum(5)}>5</button>
            <button className="btn" onClick={()=>inputNum(6)}>6</button>
            <button className="btn orange" onClick={()=>inputOp('−')}>−</button>
            
            <button className="btn" onClick={()=>inputNum(1)}>1</button>
            <button className="btn" onClick={()=>inputNum(2)}>2</button>
            <button className="btn" onClick={()=>inputNum(3)}>3</button>
            <button className="btn orange" onClick={()=>inputOp('+')}>+</button>
            
            <button className="btn zero" onClick={()=>inputNum(0)}>0</button>
            <button className="btn" onClick={()=>{if(!display.includes('.'))setDisplay(display+'.')}}>,</button>
            <button className="btn orange" onClick={()=>inputOp('=')}>=</button>
          </div>
        </div>
      )}

      {/* --- FLIP MODE --- */}
      {mode === 'flip' && (
        <div className="flip-container fade-enter">
          <div className="card">
            
            <div className="input-label">Купил (TON)</div>
            <input type="number" className="input-field" 
                   value={buy} onChange={e=>setBuy(e.target.value)} placeholder="0" />
            
            <div className="input-label" style={{marginTop:'20px'}}>Продал (TON)</div>
            <input type="number" className="input-field" 
                   value={sell} onChange={e=>setSell(e.target.value)} placeholder="0" />

            {/* БЛОК РЕЗУЛЬТАТОВ */}
            {profit !== null && (
              <div className="result-box">
                <div style={{fontSize:'13px', color:'#888', marginBottom:'5px'}}>Чистая прибыль (комиссия 5%)</div>
                
                <div className="main-profit" style={{color: profit >= 0 ? '#32d74b' : '#ff453a'}}>
                  {profit > 0 ? '+' : ''}{profit.toFixed(2)} TON
                </div>
                
                {/* МУЛЬТИ-ВАЛЮТА */}
                <div className="sub-profit">
                  <div>
                     <div style={{fontSize:'10px', color:'#555'}}>USD</div>
                     ${(profit * prices.ton).toFixed(2)}
                  </div>
                  <div>
                     <div style={{fontSize:'10px', color:'#555'}}>RUB</div>
                     ₽{(profit * prices.rub).toFixed(0)}
                  </div>
                  <div>
                     <div style={{fontSize:'10px', color:'#555'}}>BTC</div>
                     {(profit * prices.btc).toFixed(6)}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default App