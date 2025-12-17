import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('flip') 
  
  // State
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [flipProfit, setFlipProfit] = useState(null)
  
  const [starsAmount, setStarsAmount] = useState('')
  const [starsProfit, setStarsProfit] = useState(null)
  
  // КУРС TON (null означает "пока не знаем")
  const [tonPrice, setTonPrice] = useState(null)

  // State для Калькулятора
  const [calcDisplay, setCalcDisplay] = useState('0')
  const [firstNum, setFirstNum] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForSecond, setWaitingForSecond] = useState(false)

  useEffect(() => {
    // 1. Настройка Телеграма
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.setHeaderColor('#000000'); 
      window.Telegram.WebApp.expand();
    }

    // 2. ЗАГРУЗКА КУРСА TON ИЗ ИНТЕРНЕТА
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd')
      .then(response => response.json())
      .then(data => {
        // CoinGecko возвращает: { "the-open-network": { "usd": 5.42 } }
        const price = data['the-open-network'].usd;
        setTonPrice(price);
      })
      .catch(err => console.error("Ошибка загрузки курса:", err));
  }, [])

  // --- Logic Flip ---
  const calculateFlip = () => {
    const buy = parseFloat(buyPrice); 
    const sell = parseFloat(sellPrice);
    if (isNaN(buy) || isNaN(sell)) return;
    
    const fee = sell * 0.10; 
    const profit = sell - fee - buy;
    setFlipProfit(profit.toFixed(2));
  }

  // --- Logic Stars ---
  const calculateStars = () => {
    const amount = parseFloat(starsAmount);
    if (isNaN(amount)) return;
    // Курс звезды примерно $0.0135
    setStarsProfit((amount * 0.0135).toFixed(2));
  }

  // --- Logic System Calc ---
  const inputDigit = (digit) => {
    if (waitingForSecond) {
      setCalcDisplay(String(digit));
      setWaitingForSecond(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? String(digit) : calcDisplay + digit);
    }
  }
  const inputDot = () => { if (!calcDisplay.includes('.')) setCalcDisplay(calcDisplay + '.'); }
  const performOp = (nextOperator) => {
    const inputValue = parseFloat(calcDisplay);
    if (firstNum === null) { setFirstNum(inputValue); } 
    else if (operator) {
      const result = calculate(firstNum, inputValue, operator);
      setCalcDisplay(String(result).slice(0, 12));
      setFirstNum(result);
    }
    setWaitingForSecond(true);
    setOperator(nextOperator);
  }
  const calculate = (first, second, op) => {
    if (op === '+') return first + second; if (op === '-') return first - second;
    if (op === '*') return first * second; if (op === '/') return first / second;
    return second;
  }
  const resetCalc = () => { setCalcDisplay('0'); setFirstNum(null); setOperator(null); setWaitingForSecond(false); }

  return (
    <div className="glass-card">
      
      {/* HEADER: Показываем курс TON, если он загрузился */}
      {activeTab !== 'system' && (
        <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          
          <img src="/star.png" alt="Logo" style={{ width: '60px', height: '60px', filter: 'drop-shadow(0 0 15px rgba(0,122,255,0.4))' }} 
               onError={(e) => e.target.style.display = 'none'} /> 
          
          {/* Плашка с курсом */}
          {tonPrice ? (
             <div className="price-badge fade-in">
               💎 1 TON ≈ ${tonPrice}
             </div>
          ) : (
             <div className="price-badge" style={{opacity: 0.5}}>Загрузка курса...</div>
          )}

        </div>
      )}

      {/* TABS */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'flip' ? 'active' : ''}`} onClick={() => setActiveTab('flip')}>Flip</button>
        <button className={`tab-btn ${activeTab === 'stars' ? 'active' : ''}`} onClick={() => setActiveTab('stars')}>Stars</button>
        <button className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>Calc</button>
      </div>

      {/* --- FLIP --- */}
      {activeTab === 'flip' && (
        <div className="tab-content fade-in">
          <div className="input-group">
            <label>Купил (TON)</label>
            <input type="number" className="input-field" placeholder="0" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Продал (TON)</label>
            <input type="number" className="input-field" placeholder="0" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateFlip}>Посчитать профит</button>
          
          {flipProfit !== null && (
            <div className="result-box">
              <div style={{color:'#aaa', fontSize:'12px', marginBottom:'5px'}}>Чистая прибыль</div>
              
              {/* Прибыль в TON */}
              <div className="result-value" style={{color: flipProfit >= 0 ? '#4ade80' : '#ff453a'}}>
                {flipProfit} TON
              </div>
              
              {/* Прибыль в USD (считаем только если есть курс) */}
              {tonPrice && (
                 <div style={{color: '#888', fontSize: '14px', marginTop: '5px'}}>
                   ≈ ${(flipProfit * tonPrice).toFixed(2)}
                 </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- STARS --- */}
      {activeTab === 'stars' && (
        <div className="tab-content fade-in">
          <div className="input-group">
            <label>Количество Звезд</label>
            <input type="number" className="input-field" placeholder="1000" value={starsAmount} onChange={(e) => setStarsAmount(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateStars}>Конвертировать в $</button>
          {starsProfit !== null && (
            <div className="result-box" style={{background: 'rgba(255, 215, 0, 0.05)', borderColor: 'rgba(255, 215, 0, 0.2)'}}>
              <div style={{color:'#aaa', fontSize:'12px', marginBottom:'5px'}}>Примерно в долларах</div>
              <div className="result-value" style={{color: '#ffd700'}}>${starsProfit}</div>
            </div>
          )}
        </div>
      )}

      {/* --- SYSTEM --- */}
      {activeTab === 'system' && (
        <div className="tab-content fade-in">
          <div className="calc-screen">{calcDisplay}</div>
          <div className="calc-grid">
            <button className="calc-btn blue" onClick={resetCalc}><span>C</span></button>
            <button className="calc-btn blue" onClick={() => setCalcDisplay(String(parseFloat(calcDisplay) * -1))}><span>+/-</span></button>
            <button className="calc-btn blue" onClick={() => setCalcDisplay(String(parseFloat(calcDisplay) / 100))}><span>%</span></button>
            <button className="calc-btn blue" onClick={() => performOp('/')}><span>÷</span></button>
            
            <button className="calc-btn" onClick={() => inputDigit(7)}><span>7</span></button>
            <button className="calc-btn" onClick={() => inputDigit(8)}><span>8</span></button>
            <button className="calc-btn" onClick={() => inputDigit(9)}><span>9</span></button>
            <button className="calc-btn blue" onClick={() => performOp('*')}><span>×</span></button>

            <button className="calc-btn" onClick={() => inputDigit(4)}><span>4</span></button>
            <button className="calc-btn" onClick={() => inputDigit(5)}><span>5</span></button>
            <button className="calc-btn" onClick={() => inputDigit(6)}><span>6</span></button>
            <button className="calc-btn blue" onClick={() => performOp('-')}><span>−</span></button>

            <button className="calc-btn" onClick={() => inputDigit(1)}><span>1</span></button>
            <button className="calc-btn" onClick={() => inputDigit(2)}><span>2</span></button>
            <button className="calc-btn" onClick={() => inputDigit(3)}><span>3</span></button>
            <button className="calc-btn blue" onClick={() => performOp('+')}><span>+</span></button>

            <button className="calc-btn zero" onClick={() => inputDigit(0)}><span>0</span></button>
            <button className="calc-btn" onClick={inputDot}><span>.</span></button>
            <button className="calc-btn primary" onClick={() => performOp('=')}><span>=</span></button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App