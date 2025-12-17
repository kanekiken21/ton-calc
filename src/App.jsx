import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('flip') 
  
  // State
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [royalty, setRoyalty] = useState('5') // По умолчанию 5%
  const [flipProfit, setFlipProfit] = useState(null)
  
  const [starsAmount, setStarsAmount] = useState('')
  const [starsProfit, setStarsProfit] = useState(null)
  
  const [tonPrice, setTonPrice] = useState(null)

  // State для Калькулятора
  const [calcDisplay, setCalcDisplay] = useState('0')
  const [firstNum, setFirstNum] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForSecond, setWaitingForSecond] = useState(false)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.setHeaderColor('#000000'); 
      window.Telegram.WebApp.expand();
    }

    // Загрузка курса (используем более стабильный ID если нужно)
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd')
      .then(response => response.json())
      .then(data => {
        if (data['the-open-network']) {
            setTonPrice(data['the-open-network'].usd);
        }
      })
      .catch(err => console.error("Ошибка API:", err));
  }, [])

  // --- Logic Flip (ОБНОВЛЕННАЯ) ---
  const calculateFlip = () => {
    const buy = parseFloat(buyPrice); 
    const sell = parseFloat(sellPrice);
    const roy = parseFloat(royalty); // Берем процент роялти

    if (isNaN(buy) || isNaN(sell)) return;
    
    // Комиссия Getgems (всегда 5%)
    const marketplaceFee = sell * 0.05;
    
    // Роялти автора (то, что ввел юзер)
    const royaltyFee = sell * (roy / 100);
    
    // Итоговая комиссия
    const totalFee = marketplaceFee + royaltyFee;

    const profit = sell - totalFee - buy;
    setFlipProfit(profit.toFixed(2));
  }

  // --- Logic Stars ---
  const calculateStars = () => {
    const amount = parseFloat(starsAmount);
    if (isNaN(amount)) return;
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
      
      {/* HEADER */}
      {activeTab !== 'system' && (
        <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <img src="/star.png" alt="Logo" style={{ width: '60px', height: '60px', filter: 'drop-shadow(0 0 15px rgba(0,122,255,0.4))' }} 
               onError={(e) => e.target.style.display = 'none'} /> 
          
          {tonPrice ? (
             <div className="price-badge fade-in">💎 1 TON ≈ ${tonPrice}</div>
          ) : (
             <div className="price-badge" style={{opacity: 0.5}}>Wait...</div>
          )}
        </div>
      )}

      {/* TABS */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'flip' ? 'active' : ''}`} onClick={() => setActiveTab('flip')}>Flip</button>
        <button className={`tab-btn ${activeTab === 'stars' ? 'active' : ''}`} onClick={() => setActiveTab('stars')}>Stars</button>
        <button className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>Calc</button>
      </div>

      {/* --- FLIP TAB (С настройкой Роялти) --- */}
      {activeTab === 'flip' && (
        <div className="tab-content fade-in">
          
          <div className="input-row" style={{display: 'flex', gap: '10px'}}>
             <div className="input-group" style={{flex: 1}}>
                <label>Купил (TON)</label>
                <input type="number" className="input-field" placeholder="0" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
             </div>
             {/* Новое поле для Роялти */}
             <div className="input-group" style={{width: '80px'}}>
                <label>Royalty %</label>
                <input type="number" className="input-field" placeholder="5" value={royalty} onChange={(e) => setRoyalty(e.target.value)} 
                       style={{textAlign: 'center', color: '#5ac8fa', borderColor: 'rgba(90, 200, 250, 0.3)'}}/>
             </div>
          </div>

          <div className="input-group">
            <label>Продал (TON)</label>
            <input type="number" className="input-field" placeholder="0" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
          </div>

          <button className="action-btn" onClick={calculateFlip}>Посчитать</button>
          
          {flipProfit !== null && (
            <div className="result-box">
              <div style={{color:'#aaa', fontSize:'12px', marginBottom:'5px'}}>Чистая прибыль (за вычетом {5 + parseFloat(royalty || 0)}%)</div>
              
              <div className="result-value" style={{color: flipProfit >= 0 ? '#4ade80' : '#ff453a'}}>
                {flipProfit} TON
              </div>
              
              {tonPrice && (
                 <div style={{color: '#888', fontSize: '14px', marginTop: '5px'}}>
                   ≈ ${(flipProfit * tonPrice).toFixed(2)}
                 </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- STARS TAB --- */}
      {activeTab === 'stars' && (
        <div className="tab-content fade-in">
          <div className="input-group">
            <label>Количество Звезд</label>
            <input type="number" className="input-field" placeholder="1000" value={starsAmount} onChange={(e) => setStarsAmount(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateStars}>В Доллары ($)</button>
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