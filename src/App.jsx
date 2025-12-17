import { useState, useEffect } from 'react'
import './App.css'

// ВСТРОЕННАЯ БАЗА ПОПУЛЯРНЫХ ГИФТОВ (Имитация сервера)
const POPULAR_GIFTS = {
  'pepe': { 
    name: 'Plush Pepe', 
    img: 'https://cache.tonapi.io/imgproxy/b2c5w1Q7Y_14K0-44e2-6d24.png', 
    floor: '150 TON', 
    link: 'https://getgems.io/collection/EQDnwd-3r6p_jJaO7beD_S_mS2AH65MZ7b1h1N3U7W_4r6p?filter=%7B%22attributes%22%3A%5B%7B%22trait_type%22%3A%22Name%22%2C%22value%22%3A%22Plush%20Pepe%22%7D%5D%7D'
  },
  'star': { 
    name: 'Red Star', 
    img: 'https://nft.ton.diamonds/nft/0/4/12/412.png', // Пример картинки звезды
    floor: '450 TON', 
    link: 'https://getgems.io/search?q=Red%20Star'
  },
  'duck': { 
    name: 'Rubber Duck', 
    img: 'https://cache.tonapi.io/imgproxy/XX_duck_image.png', // Заглушка, если нет
    floor: '50 TON', 
    link: 'https://getgems.io/search?q=Duck'
  },
  'cake': { 
    name: 'Delicious Cake', 
    img: 'https://em-content.zobj.net/source/apple/391/birthday-cake_1f382.png',
    floor: '15 TON', 
    link: 'https://getgems.io/search?q=Cake'
  }
};

function App() {
  const [loadingApp, setLoadingApp] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  
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
  const [giftResult, setGiftResult] = useState(null)
  
  // Stars States
  const [starsAmount, setStarsAmount] = useState('')
  const [starsProfit, setStarsProfit] = useState(null)

  // Calc States
  const [calcDisplay, setCalcDisplay] = useState('0')
  const [waitingForSecond, setWaitingForSecond] = useState(false)
  const [firstNum, setFirstNum] = useState(null)
  const [operator, setOperator] = useState(null)

  useEffect(() => {
    // 1. Телеграм
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.setHeaderColor('#000000'); 
      window.Telegram.WebApp.expand();
    }
    // 2. Сплэш скрин (3 сек)
    setTimeout(() => setLoadingApp(false), 3000);
    fetchTonPrice();
  }, [])

  const fetchTonPrice = () => {
    setIsSpinning(true);
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(res => res.json())
      .then(data => { if(data.price) setTonPrice(parseFloat(data.price).toFixed(2)); })
      .finally(() => setTimeout(() => setIsSpinning(false), 1000));
  }

  // --- LOGIC ---
  const calculateFlip = () => {
    const buy = buyPrice ? parseFloat(buyPrice) : 0;
    const sell = sellPrice ? parseFloat(sellPrice) : 0;
    const roy = royalty ? parseFloat(royalty) : 5;
    if (!buy && !sell) return;
    const totalFee = sell * ((5 + roy) / 100);
    setFlipProfit((sell - totalFee - buy).toFixed(2));
  }

  const calculateStars = () => {
    const amount = starsAmount ? parseFloat(starsAmount) : 0;
    setStarsProfit((amount * 0.0135).toFixed(2));
  }

  // --- УМНЫЙ ПОИСК ГИФТОВ ---
  const handleGiftSearch = () => {
    if (!giftQuery) return;
    const q = giftQuery.toLowerCase().trim();
    
    // Проверяем нашу "Встроенную базу"
    if (POPULAR_GIFTS[q]) {
      setGiftResult(POPULAR_GIFTS[q]);
      return;
    }
    
    // Если не нашли в базе, показываем заглушку
    setGiftResult({
      name: "Поиск в Getgems...",
      desc: "Нажми кнопку ниже, чтобы открыть маркет",
      img: null,
      link: `https://getgems.io/search?q=${giftQuery}`
    });
  }

  // --- CALC LOGIC ---
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
    if (firstNum === null) { setFirstNum(inputValue); } 
    else if (operator) {
      const result = calculate(firstNum, inputValue, operator);
      setCalcDisplay(String(result).slice(0, 10));
      setFirstNum(result);
    }
    setWaitingForSecond(true); setOperator(nextOperator);
  }
  const calculate = (first, second, op) => {
    if (op === '+') return first + second; if (op === '-') return first - second;
    if (op === '*') return first * second; if (op === '/') return first / second;
    return second;
  }
  const resetCalc = () => { setCalcDisplay('0'); setFirstNum(null); setOperator(null); setWaitingForSecond(false); }

  return (
    <>
      {/* 1. SPLASH SCREEN */}
      {loadingApp && (
        <div className="splash-screen">
          <div className="splash-logo">💎</div>
          <div className="splash-text">my TON Calculator</div>
        </div>
      )}

      {/* 2. SETTINGS MODAL */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{marginBottom:'20px'}}>Настройки</h3>
            <div className="menu-item" onClick={() => alert('Скоро: TON Connect!')}>
              💎 Connect Wallet (Beta)
            </div>
            <div className="menu-item">📄 Privacy Policy</div>
            <div className="menu-item">💬 Support</div>
            <button className="action-btn" style={{background:'#333', marginTop:'20px'}} onClick={() => setShowSettings(false)}>Закрыть</button>
          </div>
        </div>
      )}

      {/* 3. MAIN APP */}
      <div className="app-container">
        <div className="glass-card">
          
          {/* HEADER */}
          <div className="app-header">
             <div className="price-badge fade-in">
               <span>💎 1 TON ≈ {tonPrice ? `$${tonPrice}` : '...'}</span>
               <button onClick={fetchTonPrice} className={`refresh-btn ${isSpinning ? 'spinning' : ''}`}>🔄</button>
             </div>
             <button className="settings-btn" onClick={() => setShowSettings(true)}>⚙️</button>
          </div>

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
                 <div className="input-group" style={{width:'40%'}}>
                   <label onClick={() => alert('Комиссия автора (роялти). Стандарт 5%')}>Royalty <span className="info-icon">ⓘ</span></label>
                   <input type="number" className="input-field" placeholder="5" value={royalty} onChange={e => setRoyalty(e.target.value)} />
                 </div>
              </div>
              <div className="input-group">
                <label>Продал (TON)</label>
                <input type="number" className="input-field" placeholder="0" value={sellPrice} onChange={e => setSellPrice(e.target.value)} />
              </div>
              <button className="action-btn" onClick={calculateFlip}>Посчитать</button>
              
              {flipProfit && (
                <div className="result-box">
                  <div style={{color:'#aaa', fontSize:'13px'}}>Чистая прибыль</div>
                  <div className="result-value" style={{color: parseFloat(flipProfit)>=0 ? '#32d74b':'#ff453a'}}>
                    {parseFloat(flipProfit) > 0 ? '+' : ''}{flipProfit} TON
                  </div>
                  {tonPrice && <div style={{color:'#888', marginTop:'5px', fontSize:'14px'}}>≈ ${(parseFloat(flipProfit)*tonPrice).toFixed(2)}</div>}
                </div>
              )}
            </div>
          )}

          {/* GIFTS TAB (С БАЗОЙ) */}
          {activeTab === 'gifts' && (
            <div className="fade-in">
              <div className="input-group">
                <label>Поиск (Pepe, Star, Cake...)</label>
                <input type="text" className="input-field" placeholder="Название..." value={giftQuery} onChange={e => setGiftQuery(e.target.value)} />
              </div>
              <button className="action-btn" onClick={handleGiftSearch}>Найти</button>

              {giftResult && (
                <div className="gift-card fade-in">
                  {giftResult.img && <img src={giftResult.img} alt="gift" className="gift-img"/>}
                  <div style={{fontSize:'20px', fontWeight:'bold'}}>{giftResult.name}</div>
                  {giftResult.floor && <div style={{color:'#5ac8fa', marginTop:'5px'}}>Floor: {giftResult.floor}</div>}
                  <div style={{color:'#888', fontSize:'13px', margin:'10px 0'}}>{giftResult.desc}</div>
                  <a href={giftResult.link} target="_blank" rel="noreferrer" style={{color:'#007aff', textDecoration:'none', fontWeight:'600'}}>
                    Смотреть на Getgems ↗
                  </a>
                </div>
              )}
            </div>
          )}

          {/* STARS TAB */}
          {activeTab === 'stars' && (
            <div className="fade-in">
              <div className="input-group">
                <label>Звезд ⭐️</label>
                <input type="number" className="input-field" placeholder="0" value={starsAmount} onChange={e => setStarsAmount(e.target.value)} />
              </div>
              <button className="action-btn" onClick={calculateStars}>Конвертировать</button>
              {starsProfit && (
                <div className="result-box" style={{background:'rgba(255, 200, 0, 0.1)'}}>
                   <div style={{color:'#aaa', fontSize:'13px'}}>В долларах</div>
                   <div className="result-value" style={{color:'#ffcc00'}}>${starsProfit}</div>
                </div>
              )}
            </div>
          )}

          {/* CALC TAB (IOS) */}
          {activeTab === 'system' && (
            <div className="fade-in">
              <div className="calc-screen">{calcDisplay}</div>
              <div className="calc-grid">
                <button className="calc-btn blue" onClick={resetCalc}><span>C</span></button>
                <button className="calc-btn blue" onClick={() => setCalcDisplay(String(parseFloat(calcDisplay)*-1))}><span>+/-</span></button>
                <button className="calc-btn blue" onClick={() => setCalcDisplay(String(parseFloat(calcDisplay)/100))}><span>%</span></button>
                <button className="calc-btn primary" onClick={() => performOp('/')}><span>÷</span></button>
                <button className="calc-btn" onClick={() => inputDigit(7)}><span>7</span></button>
                <button className="calc-btn" onClick={() => inputDigit(8)}><span>8</span></button>
                <button className="calc-btn" onClick={() => inputDigit(9)}><span>9</span></button>
                <button className="calc-btn primary" onClick={() => performOp('*')}><span>×</span></button>
                <button className="calc-btn" onClick={() => inputDigit(4)}><span>4</span></button>
                <button className="calc-btn" onClick={() => inputDigit(5)}><span>5</span></button>
                <button className="calc-btn" onClick={() => inputDigit(6)}><span>6</span></button>
                <button className="calc-btn primary" onClick={() => performOp('-')}><span>−</span></button>
                <button className="calc-btn" onClick={() => inputDigit(1)}><span>1</span></button>
                <button className="calc-btn" onClick={() => inputDigit(2)}><span>2</span></button>
                <button className="calc-btn" onClick={() => inputDigit(3)}><span>3</span></button>
                <button className="calc-btn primary" onClick={() => performOp('+')}><span>+</span></button>
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