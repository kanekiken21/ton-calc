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

  // iOS Calc State
  const [calcDisplay, setCalcDisplay] = useState('0')
  const [firstNum, setFirstNum] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForSecond, setWaitingForSecond] = useState(false)

  useEffect(() => {
    // Телеграм: красим шапку и раскрываем
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.setHeaderColor('#000000'); // Черная шапка под фон
      window.Telegram.WebApp.expand();
    }
  }, [])

  // Логика Flip
  const calculateFlip = () => {
    const buy = parseFloat(buyPrice); const sell = parseFloat(sellPrice);
    if (isNaN(buy) || isNaN(sell)) return;
    const fee = sell * 0.10; 
    setFlipProfit((sell - fee - buy).toFixed(2));
  }

  // Логика Stars (пока статический курс)
  const calculateStars = () => {
    const amount = parseFloat(starsAmount);
    if (isNaN(amount)) return;
    setStarsProfit((amount * 0.0135).toFixed(2));
  }

  // Логика iOS Calc
  const inputDigit = (digit) => {
    if (waitingForSecond) {
      setCalcDisplay(String(digit));
      setWaitingForSecond(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? String(digit) : calcDisplay + digit);
    }
  }
  const inputDot = () => {
    if (!calcDisplay.includes('.')) setCalcDisplay(calcDisplay + '.');
  }
  const performOp = (nextOperator) => {
    const inputValue = parseFloat(calcDisplay);
    if (firstNum === null) {
      setFirstNum(inputValue);
    } else if (operator) {
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
  const resetCalc = () => {
    setCalcDisplay('0'); setFirstNum(null); setOperator(null); setWaitingForSecond(false);
  }

  return (
    <div className="glass-card">
      {/* Логотип (звезда) */}
      {activeTab !== 'system' && (
        <div style={{ marginBottom: '15px' }}>
          <img src="/star.png" alt="Logo" style={{ width: '70px', height: '70px', filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.3))' }} 
               onError={(e) => e.target.style.display = 'none'} /> 
        </div>
      )}

      {/* Меню вкладок iOS Style */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'flip' ? 'active' : ''}`} onClick={() => setActiveTab('flip')}>Flip</button>
        <button className={`tab-btn ${activeTab === 'stars' ? 'active' : ''}`} onClick={() => setActiveTab('stars')}>Stars</button>
        <button className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>Calc</button>
      </div>

      {/* Вкладка 1: FLIP */}
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
          <button className="action-btn" onClick={calculateFlip}>Считать</button>
          {flipProfit !== null && (
            <div className="result-box">
              <div>Прибыль:</div>
              <div className="result-value" style={{color: flipProfit >= 0 ? '#32d74b' : '#ff453a'}}>{flipProfit} TON</div>
            </div>
          )}
        </div>
      )}

      {/* Вкладка 2: STARS */}
      {activeTab === 'stars' && (
        <div className="tab-content fade-in">
          <div className="input-group">
            <label>Количество Звезд</label>
            <input type="number" className="input-field" placeholder="1000" value={starsAmount} onChange={(e) => setStarsAmount(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateStars}>В Доллары ($)</button>
          {starsProfit !== null && (
            <div className="result-box" style={{background: 'rgba(255, 215, 0, 0.1)'}}>
              <div className="result-value" style={{color: '#ffd700'}}>${starsProfit}</div>
            </div>
          )}
        </div>
      )}

      {/* Вкладка 3: SYSTEM CALCULATOR (С кнопками в <span>) */}
      {activeTab === 'system' && (
        <div className="tab-content fade-in">
          <div className="calc-screen">{calcDisplay}</div>
          <div className="calc-grid">
            <button className="calc-btn gray" onClick={resetCalc}><span>C</span></button>
            <button className="calc-btn gray" onClick={() => setCalcDisplay(String(parseFloat(calcDisplay) * -1))}><span>+/-</span></button>
            <button className="calc-btn gray" onClick={() => setCalcDisplay(String(parseFloat(calcDisplay) / 100))}><span>%</span></button>
            <button className="calc-btn orange" onClick={() => performOp('/')}><span>÷</span></button>
            
            <button className="calc-btn" onClick={() => inputDigit(7)}><span>7</span></button>
            <button className="calc-btn" onClick={() => inputDigit(8)}><span>8</span></button>
            <button className="calc-btn" onClick={() => inputDigit(9)}><span>9</span></button>
            <button className="calc-btn orange" onClick={() => performOp('*')}><span>×</span></button>

            <button className="calc-btn" onClick={() => inputDigit(4)}><span>4</span></button>
            <button className="calc-btn" onClick={() => inputDigit(5)}><span>5</span></button>
            <button className="calc-btn" onClick={() => inputDigit(6)}><span>6</span></button>
            <button className="calc-btn orange" onClick={() => performOp('-')}><span>−</span></button>

            <button className="calc-btn" onClick={() => inputDigit(1)}><span>1</span></button>
            <button className="calc-btn" onClick={() => inputDigit(2)}><span>2</span></button>
            <button className="calc-btn" onClick={() => inputDigit(3)}><span>3</span></button>
            <button className="calc-btn orange" onClick={() => performOp('+')}><span>+</span></button>

            <button className="calc-btn zero" onClick={() => inputDigit(0)}><span>0</span></button>
            <button className="calc-btn" onClick={inputDot}><span>.</span></button>
            <button className="calc-btn orange" onClick={() => performOp('=')}><span>=</span></button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App