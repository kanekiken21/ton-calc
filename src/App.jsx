import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('flip') 
  
  // State для Flip
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [flipProfit, setFlipProfit] = useState(null)

  // State для Stars
  const [starsAmount, setStarsAmount] = useState('')
  const [starsProfit, setStarsProfit] = useState(null)

  // State для iOS Calculator
  const [calcDisplay, setCalcDisplay] = useState('0')
  const [firstNum, setFirstNum] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForSecond, setWaitingForSecond] = useState(false)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.setHeaderColor('#1a202c'); 
      window.Telegram.WebApp.expand();
    }
  }, [])

  // --- Логика Flip ---
  const calculateFlip = () => {
    const buy = parseFloat(buyPrice);
    const sell = parseFloat(sellPrice);
    if (isNaN(buy) || isNaN(sell)) return;
    const fee = sell * 0.10; 
    setFlipProfit((sell - fee - buy).toFixed(2));
  }

  // --- Логика Stars ---
  const calculateStars = () => {
    const amount = parseFloat(starsAmount);
    if (isNaN(amount)) return;
    const rateUsd = 0.0135; // Чуть точнее курс
    setStarsProfit((amount * rateUsd).toFixed(2));
  }

  // --- Логика iOS Calc ---
  const inputDigit = (digit) => {
    if (waitingForSecond) {
      setCalcDisplay(String(digit));
      setWaitingForSecond(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? String(digit) : calcDisplay + digit);
    }
  }

  const inputDot = () => {
    if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.');
      setWaitingForSecond(false);
    }
  }

  const performOp = (nextOperator) => {
    const inputValue = parseFloat(calcDisplay);

    if (firstNum === null) {
      setFirstNum(inputValue);
    } else if (operator) {
      const result = calculate(firstNum, inputValue, operator);
      setCalcDisplay(String(result).slice(0, 10)); // Обрезаем, если длинное число
      setFirstNum(result);
    }

    setWaitingForSecond(true);
    setOperator(nextOperator);
  }

  const calculate = (first, second, op) => {
    if (op === '+') return first + second;
    if (op === '-') return first - second;
    if (op === '*') return first * second;
    if (op === '/') return first / second;
    return second;
  }

  const resetCalc = () => {
    setCalcDisplay('0');
    setFirstNum(null);
    setOperator(null);
    setWaitingForSecond(false);
  }

  return (
    <div className="glass-card">
       {/* Логотип только на первых двух вкладках */}
      {activeTab !== 'system' && (
        <div style={{ marginBottom: '10px' }}>
          <img src="/star.png" alt="Logo" style={{ width: '60px', height: '60px' }} 
               onError={(e) => e.target.style.display = 'none'} /> 
        </div>
      )}

      {/* Меню вкладок */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'flip' ? 'active' : ''}`} onClick={() => setActiveTab('flip')}>Flip</button>
        <button className={`tab-btn ${activeTab === 'stars' ? 'active' : ''}`} onClick={() => setActiveTab('stars')}>Stars</button>
        <button className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>Calc</button>
      </div>

      {/* Вкладка 1: FLIP */}
      {activeTab === 'flip' && (
        <div className="tab-content fade-in">
           <h2>Flip Calculator 💎</h2>
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
              <div className="result-value" style={{color: flipProfit >= 0 ? '#4ade80' : '#ff4d4d'}}>
                {flipProfit} TON
              </div>
            </div>
          )}
        </div>
      )}

      {/* Вкладка 2: STARS */}
      {activeTab === 'stars' && (
        <div className="tab-content fade-in">
          <h2>Stars Converter ⭐️</h2>
          <div className="input-group">
            <label>Количество Звезд</label>
            <input type="number" className="input-field" placeholder="1000" value={starsAmount} onChange={(e) => setStarsAmount(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateStars}>В Доллары ($)</button>
          {starsProfit !== null && (
            <div className="result-box" style={{borderColor: 'gold'}}>
              <div className="result-value" style={{color: '#ffd700'}}>${starsProfit}</div>
            </div>
          )}
        </div>
      )}

      {/* Вкладка 3: SYSTEM CALCULATOR */}
      {activeTab === 'system' && (
        <div className="tab-content fade-in">
          <div className="calc-screen">{calcDisplay}</div>
          <div className="calc-grid">
            <button className="calc-btn gray" onClick={resetCalc}>C</button>
            <button className="calc-btn gray" onClick={() => setCalcDisplay(String(parseFloat(calcDisplay) * -1))}>+/-</button>
            <button className="calc-btn gray" onClick={() => setCalcDisplay(String(parseFloat(calcDisplay) / 100))}>%</button>
            <button className="calc-btn orange" onClick={() => performOp('/')}>÷</button>
            
            <button className="calc-btn" onClick={() => inputDigit(7)}>7</button>
            <button className="calc-btn" onClick={() => inputDigit(8)}>8</button>
            <button className="calc-btn" onClick={() => inputDigit(9)}>9</button>
            <button className="calc-btn orange" onClick={() => performOp('*')}>×</button>

            <button className="calc-btn" onClick={() => inputDigit(4)}>4</button>
            <button className="calc-btn" onClick={() => inputDigit(5)}>5</button>
            <button className="calc-btn" onClick={() => inputDigit(6)}>6</button>
            <button className="calc-btn orange" onClick={() => performOp('-')}>−</button>

            <button className="calc-btn" onClick={() => inputDigit(1)}>1</button>
            <button className="calc-btn" onClick={() => inputDigit(2)}>2</button>
            <button className="calc-btn" onClick={() => inputDigit(3)}>3</button>
            <button className="calc-btn orange" onClick={() => performOp('+')}>+</button>

            <button className="calc-btn zero" onClick={() => inputDigit(0)}>0</button>
            <button className="calc-btn" onClick={inputDot}>.</button>
            <button className="calc-btn orange" onClick={() => performOp('=')}>=</button>
          </div>
        </div>
      )}

    </div>
  )
}

export default App