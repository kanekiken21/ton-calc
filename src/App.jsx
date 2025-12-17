import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // --- STATES ---
  const [loadingApp, setLoadingApp] = useState(true) // Сплэш скрин
  const [showOnboarding, setShowOnboarding] = useState(false) // Обучение
  
  const [activeTab, setActiveTab] = useState('flip') 
  const [tonPrice, setTonPrice] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)

  // Flip States
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [royalty, setRoyalty] = useState('') 
  const [flipProfit, setFlipProfit] = useState(null)

  // Gifts States
  const [giftQuery, setGiftQuery] = useState('')
  
  // Stars States
  const [starsAmount, setStarsAmount] = useState('')
  const [starsProfit, setStarsProfit] = useState(null)

  // Calc States
  const [calcDisplay, setCalcDisplay] = useState('0')
  const [waitingForSecond, setWaitingForSecond] = useState(false)
  const [firstNum, setFirstNum] = useState(null)
  const [operator, setOperator] = useState(null)

  // --- INIT ---
  useEffect(() => {
    // 1. Настройка Телеграма
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.setHeaderColor('#000000'); 
      window.Telegram.WebApp.expand();
    }

    // 2. Проверка: первый ли раз юзер тут?
    const visited = localStorage.getItem('visited_v1');
    if (!visited) {
      setShowOnboarding(true);
      localStorage.setItem('visited_v1', 'true');
    }

    // 3. Убираем сплэш через 2.5 сек
    setTimeout(() => setLoadingApp(false), 2500);

    fetchTonPrice();
  }, [])

  // --- API ---
  const fetchTonPrice = () => {
    setIsSpinning(true);
    // Берем курс с Binance (Самый надежный)
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(res => res.json())
      .then(data => {
         if(data.price) setTonPrice(parseFloat(data.price).toFixed(2));
      })
      .catch(err => console.error("API Error", err))
      .finally(() => setTimeout(() => setIsSpinning(false), 1000));
  }

  // --- LOGIC ---
  const calculateFlip = () => {
    const buy = buyPrice ? parseFloat(buyPrice) : 0;
    const sell = sellPrice ? parseFloat(sellPrice) : 0;
    const roy = royalty ? parseFloat(royalty) : 5; // По умолчанию 5%
    
    if (!buy && !sell) return;

    // Комиссия Getgems (5%) + Роялти
    const totalFeePercent = 5 + roy;
    const totalFee = sell * (totalFeePercent / 100);
    
    setFlipProfit((sell - totalFee - buy).toFixed(2));
  }

  const calculateStars = () => {
    const amount = starsAmount ? parseFloat(starsAmount) : 0;
    setStarsProfit((amount * 0.0135).toFixed(2));
  }

  const handleGiftSearch = () => {
    if (!giftQuery) return;
    // Генерируем ссылку на ПОИСК Getgems
    const query = encodeURIComponent(giftQuery);
    window.open(`https://getgems.io/search?q=${query}`, '_blank');
  }

  // --- CALC LOGIC (FIXED) ---
  const inputDigit = (digit) => {
    if (waitingForSecond) {
      setCalcDisplay(String(digit));
      setWaitingForSecond(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? String(digit) : calcDisplay + String(digit));
    }
  }
  
  const performOp = (nextOperator) => {
    const inputValue = parseFloat(calcDisplay);
    if (firstNum === null) {
      setFirstNum(inputValue);
    } else if (operator) {
      const result = calculate(firstNum, inputValue, operator);
      setCalcDisplay(String(result).slice(0, 10));
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
    setCalcDisplay('0'); setFirstNum(null); setOperator(null); setWaitingForSecond(false);
  }

  return (
    <>
      {/* 1. SPLASH SCREEN */}
      {loadingApp && (
        <div className="splash-screen">
          <div className="splash-logo">💎</div>
          <div className="splash-text">TON TOOLS</div>
        </div>
      )}

      {/* 2. ONBOARDING (Только первый раз) */}
      {!loadingApp && showOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-card fade-in">
            <div className="onboarding-icon">👋</div>
            <div className="onboarding-title">Привет!</div>
            <div className="onboarding-desc">
              Это твой карманный помощник для TON.<br/><br/>
              1. Считай прибыль с NFT<br/>
              2. Ищи коллекции<br/>
              3. Конвертируй звезды
            </div>
            <button className="action-btn" onClick={() => setShowOnboarding(false)}>Погнали!</button>
          </div>
        </div>
      )}

      {/* 3. MAIN APP */}
      <div className="app-container">
        <div className="glass-card">
          
          {/* HEADER */}
          {activeTab !== 'system' && (
             <div className="price-badge fade-in">
               <span>💎 1 TON ≈ {tonPrice ? `$${tonPrice}` : '...'}</span>
               <button onClick={fetchTonPrice} className={`refresh-btn ${isSpinning ? 'spinning' : ''}`}>🔄</button>
             </div>
          )}

          {/* TABS */}
          <div className="tabs">
            <button className={`tab-btn ${activeTab === 'flip' ? 'active' : ''}`} onClick={() => setActiveTab('flip')}>Flip</button>
            <button className={`tab-btn ${activeTab === 'gifts' ? 'active' : ''}`} onClick={() => setActiveTab('gifts')}>Gifts</button>
            <button className={`tab-btn ${activeTab === 'stars' ? 'active' : ''}`} onClick={() => setActiveTab('stars')}>Stars</button>
            <button className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>Calc</button>
          </div>

          {/* FLIP TAB */}
          {activeTab === 'flip' && (
            <div className="fade-in">
              <div className="input-row">
                 <div className="input-group" style={{flex:1}}>
                   <label>Купил (TON)</label>
                   <input type="number" className="input-field" placeholder="0" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
                 </div>
                 <div className="input-group" style={{width:'35%'}}>
                   <label onClick={() => alert('Комиссия автора коллекции (стандарт 5%)')}>Royalty (?)</label>
                   <input type="number" className="input-field" placeholder="5" value={royalty} onChange={e => setRoyalty(e.target.value)} style={{borderColor:'#5ac8fa'}}/>
                 </div>
              </div>
              <div className="input-group">
                <label>Продал (TON)</label>
                <input type="number" className="input-field" placeholder="0" value={sellPrice} onChange={e => setSellPrice(e.target.value)} />
              </div>
              <button className="action-btn" onClick={calculateFlip}>Посчитать</button>
              
              {flipProfit && (
                <div className="result-box">
                  <div style={{color:'#aaa', fontSize:'12px'}}>Чистая прибыль</div>
                  <div className="result-value" style={{color: parseFloat(flipProfit)>=0 ? '#32d74b':'#ff453a'}}>
                    {parseFloat(flipProfit) > 0 ? '+' : ''}{flipProfit} TON
                  </div>
                  {tonPrice && <div style={{color:'#888', marginTop:'5px'}}>≈ ${(parseFloat(flipProfit)*tonPrice).toFixed(2)}</div>}
                </div>
              )}
            </div>
          )}

          {/* GIFTS TAB */}
          {activeTab === 'gifts' && (
            <div className="fade-in">
              <div className="input-group">
                <label>Название (Pepe, Star...)</label>
                <input type="text" className="input-field" placeholder="Введите название..." value={giftQuery} onChange={e => setGiftQuery(e.target.value)} />
              </div>
              <button className="action-btn" onClick={handleGiftSearch}>Найти на Getgems ↗</button>
              <p style={{fontSize:'13px', color:'#666', marginTop:'15px'}}>Откроет официальный поиск Getgems</p>
            </div>
          )}

          {/* STARS TAB */}
          {activeTab === 'stars' && (
            <div className="fade-in">
              <div className="input-group">
                <label>Звезд ⭐️</label>
                <input type="number" className="input-field" placeholder="0" value={starsAmount} onChange={e => setStarsAmount(e.target.value)} />
              </div>
              <button className="action-btn" onClick={calculateStars}>В Доллары</button>
              {starsProfit && (
                <div className="result-box" style={{borderColor:'gold', background:'rgba(255,215,0,0.1)'}}>
                   <div className="result-value" style={{color:'#ffd700'}}>${starsProfit}</div>
                </div>
              )}
            </div>
          )}

          {/* CALC TAB */}
          {activeTab === 'system' && (
            <div className="fade-in">
              <div className="calc-screen">{calcDisplay}</div>
              <div className="calc-grid">
                <button className="calc-btn blue" onClick={resetCalc}><span>C</span></button>
                <button className="calc-btn blue" onClick={() => setCalcDisplay(String(parseFloat(calcDisplay)*-1))}><span>+/-</span></button>
                <button className="calc-btn blue" onClick={() => setCalcDisplay(String(parseFloat(calcDisplay)/100))}><span>%</span></button>
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
                <button className="calc-btn" onClick={() => { if(!calcDisplay.includes('.')) setCalcDisplay(calcDisplay+'.') }}><span>.</span></button>
                <button className="calc-btn primary" onClick={() => performOp('=')}><span>=</span></button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default App