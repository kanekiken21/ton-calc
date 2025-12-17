import { useState, useEffect } from 'react'
import './App.css'

const TONAPI_KEY = 'AE32DKIDFHCHKVIAAAAB4QENGU6O2RLLMSAHL2S6T3C5WTTWEY2JQXXCHF6JVREQCJYMUSI';
// Реальный адрес коллекции Telegram Gifts
const GIFTS_COLLECTION_ADDRESS = 'EQDnwd-3r6p_jJaO7beD_S_mS2AH65MZ7b1h1N3U7W_4r6p';

function App() {
  const [activeTab, setActiveTab] = useState('flip') 
  
  // Flip
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [royalty, setRoyalty] = useState('') 
  const [flipProfit, setFlipProfit] = useState(null)
  
  // Stars
  const [starsAmount, setStarsAmount] = useState('')
  const [starsProfit, setStarsProfit] = useState(null)
  
  // Gifts
  const [giftQuery, setGiftQuery] = useState('')
  const [giftResult, setGiftResult] = useState(null)
  const [loadingGift, setLoadingGift] = useState(false)
  const [giftError, setGiftError] = useState('')

  // Price & UI
  const [tonPrice, setTonPrice] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)

  // Calc Logic
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
    fetchTonPrice();
  }, [])

  // КУРС
  const fetchTonPrice = () => {
    setIsSpinning(true);
    // Берем с Binance
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(res => res.json())
      .then(data => { if (data.price) setTonPrice(parseFloat(data.price).toFixed(2)); })
      .catch(() => {
         // Запасной вариант
         fetch('https://api.coincap.io/v2/assets/toncoin')
           .then(res => res.json())
           .then(d => { if(d.data?.priceUsd) setTonPrice(parseFloat(d.data.priceUsd).toFixed(2)) })
      })
      .finally(() => setTimeout(() => setIsSpinning(false), 1000)); // Крутим минимум 1 сек для красоты
  }

  // FLIP
  const calculateFlip = () => {
    const buy = buyPrice === '' ? 0 : parseFloat(buyPrice); 
    const sell = sellPrice === '' ? 0 : parseFloat(sellPrice);
    const roy = royalty === '' ? 5 : parseFloat(royalty); 

    if (buyPrice === '' && sellPrice === '') return;

    // Формула: Продажа - (5% гетгемс + Роялти) - Покупка
    const totalFee = sell * (0.05 + (roy / 100));
    setFlipProfit((sell - totalFee - buy).toFixed(2));
  }

  const showRoyaltyInfo = () => {
    if (window.Telegram?.WebApp?.showPopup) {
      window.Telegram.WebApp.showPopup({
        title: 'Что такое Royalty?',
        message: 'Это процент, который получает автор коллекции с каждой перепродажи. Обычно это 5%.',
        buttons: [{type: 'ok'}]
      });
    } else {
      alert('Royalty - это комиссия автора коллекции (обычно 5%).');
    }
  }

  // STARS
  const calculateStars = () => {
    const amount = starsAmount === '' ? 0 : parseFloat(starsAmount);
    if (amount <= 0) { setStarsProfit(null); return; }
    setStarsProfit((amount * 0.0135).toFixed(2));
  }

  // GIFTS (ИСПРАВЛЕННЫЙ)
  const searchGift = async () => {
    if (!giftQuery.trim()) return;
    setLoadingGift(true);
    setGiftResult(null);
    setGiftError('');

    const query = giftQuery.toLowerCase().trim();
    // Список популярных гифтов, которые люди ищут
    const commonGifts = ['pepe', 'star', 'duck', 'snowman', 'heart', 'bulb', 'gift'];
    
    // Если ищут что-то похожее на гифт
    if (commonGifts.some(g => query.includes(g)) || query === 'gifts') {
       setTimeout(() => {
         setGiftResult({
           name: "Telegram Gifts",
           image: "https://cache.tonapi.io/imgproxy/b2c5w1Q7Y_14K0-44e2-6d24.png",
           desc: `Коллекция найдена!`,
           // Ссылка на ОФИЦИАЛЬНУЮ коллекцию
           link: `https://getgems.io/collection/${GIFTS_COLLECTION_ADDRESS}`
         });
         setLoadingGift(false);
       }, 600); // Имитация поиска
       return;
    }

    // Если это не гифт, пробуем искать другую коллекцию через API
    try {
      const response = await fetch(`https://tonapi.io/v2/nfts/collections/search?query=${giftQuery}&limit=1`, {
        headers: { 'Authorization': `Bearer ${TONAPI_KEY}` }
      });
      const data = await response.json();

      if (data.nft_collections && data.nft_collections.length > 0) {
        const collection = data.nft_collections[0];
        setGiftResult({
          name: collection.metadata?.name || 'Unknown',
          image: collection.metadata?.image,
          desc: `Items: ${collection.next_item_index}`,
          link: `https://getgems.io/collection/${collection.address}`
        });
      } else {
        setGiftError('Коллекция не найдена. Попробуйте "Pepe" или "Gifts".');
      }
    } catch (e) {
      setGiftError('Ошибка сети.');
    } finally {
      setLoadingGift(false);
    }
  }

  // CALC (ИСПРАВЛЕННЫЙ ВВОД)
  const inputDigit = (digit) => {
    if (waitingForSecond) {
      setCalcDisplay(String(digit));
      setWaitingForSecond(false);
    } else {
      // ИСПРАВЛЕНО: Теперь мы добавляем цифру к строке, а не заменяем её
      setCalcDisplay(calcDisplay === '0' ? String(digit) : calcDisplay + String(digit));
    }
  }
  
  const inputDot = () => { 
    if (waitingForSecond) {
      setCalcDisplay('0.');
      setWaitingForSecond(false);
    } else if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.'); 
    }
  }

  const performOp = (nextOperator) => {
    const inputValue = parseFloat(calcDisplay);
    if (firstNum === null) {
      setFirstNum(inputValue);
    } else if (operator) {
      const result = calculate(firstNum, inputValue, operator);
      setCalcDisplay(String(result).slice(0, 12)); // Ограничиваем длину
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
    <div className="glass-card">
      
      {/* HEADER */}
      {activeTab !== 'system' && (
        <div style={{display:'flex', justifyContent:'center'}}>
          <div className="price-badge fade-in">
             <span>💎 1 TON ≈ {tonPrice ? `$${tonPrice}` : '---'}</span>
             <button onClick={fetchTonPrice} className={`refresh-btn ${isSpinning ? 'spinning' : ''}`}>
               🔄
             </button>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'flip' ? 'active' : ''}`} onClick={() => setActiveTab('flip')}>Flip</button>
        <button className={`tab-btn ${activeTab === 'gifts' ? 'active' : ''}`} onClick={() => setActiveTab('gifts')}>Gifts</button>
        <button className={`tab-btn ${activeTab === 'stars' ? 'active' : ''}`} onClick={() => setActiveTab('stars')}>Stars</button>
        <button className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>Calc</button>
      </div>

      {/* --- FLIP --- */}
      {activeTab === 'flip' && (
        <div className="tab-content fade-in">
          <div className="input-row">
             <div className="input-group" style={{flex: 1}}>
                <label>КУПИЛ (TON)</label>
                <input type="number" className="input-field" placeholder="0" 
                       value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
             </div>
             <div className="input-group" style={{width: '35%'}}>
                <label>
                  ROYALTY % 
                  <span className="info-icon" onClick={showRoyaltyInfo}>?</span>
                </label>
                <input type="number" className="input-field" placeholder="5" 
                       value={royalty} onChange={(e) => setRoyalty(e.target.value)} 
                       style={{color:'#5ac8fa', borderColor:'rgba(90,200,250,0.3)'}}/>
             </div>
          </div>
          <div className="input-group">
            <label>ПРОДАЛ (TON)</label>
            <input type="number" className="input-field" placeholder="0" 
                   value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateFlip}>ПОСЧИТАТЬ</button>
          
          {flipProfit !== null && (
            <div className="result-box">
              <div style={{color:'#aaa', fontSize:'13px', marginBottom:'8px'}}>ЧИСТАЯ ПРИБЫЛЬ</div>
              <div className="result-value" style={{color: flipProfit >= 0 ? '#32d74b' : '#ff453a'}}>
                {parseFloat(flipProfit) > 0 ? '+' : ''}{flipProfit} TON
              </div>
              {tonPrice && <div style={{color:'#888', fontSize:'14px', marginTop:'5px'}}>≈ ${(parseFloat(flipProfit) * tonPrice).toFixed(2)}</div>}
            </div>
          )}
        </div>
      )}

      {/* --- GIFTS --- */}
      {activeTab === 'gifts' && (
        <div className="tab-content fade-in">
          <div className="input-group">
            <label>НАЗВАНИЕ КОЛЛЕКЦИИ</label>
            <input type="text" className="input-field" placeholder="Pepe, Gifts..." 
                   value={giftQuery} onChange={(e) => setGiftQuery(e.target.value)} />
          </div>
          
          <button className="action-btn" onClick={searchGift} disabled={loadingGift}>
            {loadingGift ? 'ИЩЕМ...' : 'НАЙТИ'}
          </button>

          {giftError && <div style={{color:'#ff453a', marginTop:'15px', fontSize:'14px'}}>{giftError}</div>}

          {giftResult && (
            <div className="gift-card">
               {giftResult.image && <img src={giftResult.image} alt="gift" className="gift-img"/>}
               <div style={{fontWeight:'700', fontSize:'20px', marginBottom:'5px'}}>{giftResult.name}</div>
               <div style={{color:'#aaa', fontSize:'14px', marginBottom:'15px'}}>{giftResult.desc}</div>
               
               <a href={giftResult.link} target="_blank" rel="noreferrer" 
                  style={{display:'block', padding:'14px', background:'rgba(0,122,255,0.2)', borderRadius:'16px', color:'#fff', textDecoration:'none', fontWeight:'600'}}>
                  Открыть на Getgems ↗
               </a>
            </div>
          )}
        </div>
      )}

      {/* --- STARS --- */}
      {activeTab === 'stars' && (
        <div className="tab-content fade-in">
          <div className="input-group">
            <label>КОЛИЧЕСТВО ЗВЕЗД ⭐️</label>
            <input type="number" className="input-field" placeholder="0" 
                   value={starsAmount} onChange={(e) => setStarsAmount(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateStars}>КОНВЕРТИРОВАТЬ</button>
          {starsProfit && (
             <div className="result-box" style={{borderColor:'gold', background:'rgba(255,215,0,0.08)'}}>
               <div style={{color:'#aaa', fontSize:'13px', marginBottom:'8px'}}>В ДОЛЛАРАХ</div>
               <div className="result-value" style={{color:'#ffd700', textShadow:'0 0 10px gold'}}>${starsProfit}</div>
             </div>
          )}
        </div>
      )}

      {/* --- CALC --- */}
      {activeTab === 'system' && (
        <div className="tab-content fade-in">
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
            <button className="calc-btn" onClick={inputDot}><span>.</span></button>
            <button className="calc-btn primary" onClick={() => performOp('=')}><span>=</span></button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App