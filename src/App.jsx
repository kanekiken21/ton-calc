import { useState, useEffect } from 'react'
import './App.css'

// Ключ TonAPI (оставляем, но обрабатываем ошибки)
const TONAPI_KEY = 'AE32DKIDFHCHKVIAAAAB4QENGU6O2RLLMSAHL2S6T3C5WTTWEY2JQXXCHF6JVREQCJYMUSI';

function App() {
  const [activeTab, setActiveTab] = useState('flip') 
  
  // Flip (Убрали дефолтную 5, теперь пусто)
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [royalty, setRoyalty] = useState('') // Пусто по умолчанию
  const [flipProfit, setFlipProfit] = useState(null)
  
  // Stars
  const [starsAmount, setStarsAmount] = useState('')
  const [starsProfit, setStarsProfit] = useState(null)
  
  // Gifts
  const [giftQuery, setGiftQuery] = useState('')
  const [giftResult, setGiftResult] = useState(null)
  const [loadingGift, setLoadingGift] = useState(false)
  const [giftError, setGiftError] = useState('')

  // Price
  const [tonPrice, setTonPrice] = useState(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)

  // Calc
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

  // 1. ИСПОЛЬЗУЕМ BINANCE API (Самый надежный)
  const fetchTonPrice = () => {
    setIsLoadingPrice(true);
    fetch('https://api.binance.com/api/v3/ticker/price?symbol=TONUSDT')
      .then(res => res.json())
      .then(data => {
        if (data.price) {
            setTonPrice(parseFloat(data.price).toFixed(2));
        }
      })
      .catch(err => {
        console.error("Ошибка Binance API:", err);
        // Если Бинанс не работает, пробуем CoinCap как запасной
        fetch('https://api.coincap.io/v2/assets/toncoin')
          .then(res => res.json())
          .then(d => { if(d.data?.priceUsd) setTonPrice(parseFloat(d.data.priceUsd).toFixed(2)) })
      })
      .finally(() => setIsLoadingPrice(false));
  }

  // --- Logic Flip ---
  const calculateFlip = () => {
    const buy = buyPrice === '' ? 0 : parseFloat(buyPrice); 
    const sell = sellPrice === '' ? 0 : parseFloat(sellPrice);
    // Если пусто, считаем как 5% (стандарт), если ввели 0 - то 0
    const roy = royalty === '' ? 5 : parseFloat(royalty); 

    if (buyPrice === '' && sellPrice === '') return;

    const totalFee = sell * (0.05 + (roy / 100));
    setFlipProfit((sell - totalFee - buy).toFixed(2));
  }

  // --- Logic Stars ---
  const calculateStars = () => {
    const amount = starsAmount === '' ? 0 : parseFloat(starsAmount);
    if (amount <= 0) { setStarsProfit(null); return; }
    setStarsProfit((amount * 0.0135).toFixed(2));
  }

  // --- Logic Gifts (УМНЫЙ ПОИСК) ---
  const searchGift = async () => {
    if (!giftQuery.trim()) return;
    setLoadingGift(true);
    setGiftResult(null);
    setGiftError('');

    const query = giftQuery.toLowerCase().trim();

    // ХИТРОСТЬ: Если ищут конкретный подарок (pepe, star, etc), 
    // мы отправляем их в коллекцию Gifts с фильтром
    const commonGifts = ['pepe', 'star', 'duck', 'snowman', 'heart', 'bulb'];
    const isCommonGift = commonGifts.some(g => query.includes(g));

    if (isCommonGift || query.includes('gift')) {
       // Это подарок!
       setLoadingGift(false);
       setGiftResult({
         name: "Telegram Gifts",
         image: "https://cache.tonapi.io/imgproxy/b2c5w1Q7Y_14K0-44e2-6d24.png", // Иконка Gifts
         description: `Ищем "${giftQuery}"...`,
         // Ссылка с поиском по атрибутам на Getgems
         link: `https://getgems.io/collection/EQD2Vj14e0c4k... (ссылка на коллекцию)?filter={"attributes":[{"trait_type":"Name","value":"${giftQuery}"}]}`, 
         // Простая ссылка (чтобы не ломать голову с JSON в URL пока что):
         simpleLink: `https://getgems.io/collection/EQDnwd-3r6... (адрес Gifts)` // Адрес коллекции Gifts
       });
       // Для простоты покажем общую коллекцию Gifts
       searchCollection("Gifts"); 
       return;
    }

    // Иначе ищем как коллекцию
    await searchCollection(query);
  }

  const searchCollection = async (q) => {
    try {
      const response = await fetch(`https://tonapi.io/v2/nfts/collections/search?query=${q}&limit=1`, {
        headers: { 'Authorization': `Bearer ${TONAPI_KEY}` }
      });
      
      const data = await response.json();

      if (data.nft_collections && data.nft_collections.length > 0) {
        const collection = data.nft_collections[0];
        setGiftResult({
          name: collection.metadata?.name || 'Unknown',
          image: collection.metadata?.image,
          count: collection.next_item_index,
          address: collection.address,
          link: `https://getgems.io/collection/${collection.address}`
        });
      } else {
        setGiftError('Коллекция не найдена. Попробуйте "Gifts".');
      }
    } catch (e) {
      setGiftError('Ошибка сети. Попробуйте позже.');
    } finally {
      setLoadingGift(false);
    }
  }

  // --- Logic Calc ---
  const inputDigit = (digit) => {
    if (waitingForSecond) { setCalcDisplay(String(digit)); setWaitingForSecond(false); } 
    else { setCalcDisplay(calcDisplay === '0' ? String(digit) : calcDisplay + digit); }
  }
  const inputDot = () => { if (!calcDisplay.includes('.')) setCalcDisplay(calcDisplay + '.'); }
  const performOp = (nextOperator) => {
    const inputValue = parseFloat(calcDisplay);
    if (firstNum === null) setFirstNum(inputValue);
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
    <div className="glass-card">
      
      {/* HEADER: КУРС (BINANCE) */}
      {activeTab !== 'system' && (
        <div style={{display:'flex', justifyContent:'center'}}>
          <div className="price-badge fade-in">
             <span>💎 1 TON ≈ {tonPrice ? `$${tonPrice}` : '---'}</span>
             <button onClick={fetchTonPrice} className="refresh-btn">🔄</button>
          </div>
        </div>
      )}

      {/* МЕНЮ ВКЛАДОК */}
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
                <label>ROYALTY %</label>
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
          <p style={{fontSize:'14px', color:'#888', marginBottom:'20px'}}>
            Поиск коллекций на Getgems
          </p>
          
          <div className="input-group">
            <label>НАЗВАНИЕ (Example: Gifts)</label>
            <input type="text" className="input-field" placeholder="Gifts..." 
                   value={giftQuery} onChange={(e) => setGiftQuery(e.target.value)} />
          </div>
          
          <button className="action-btn" onClick={searchGift} disabled={loadingGift}>
            {loadingGift ? 'ИЩЕМ...' : 'НАЙТИ'}
          </button>

          {giftError && <div style={{color:'#ff453a', marginTop:'15px', fontSize:'14px'}}>{giftError}</div>}

          {giftResult && (
            <div className="gift-card fade-in">
               {giftResult.image && <img src={giftResult.image} alt="gift" className="gift-img"/>}
               <div style={{fontWeight:'700', fontSize:'20px', marginBottom:'5px'}}>{giftResult.name}</div>
               
               {/* Если мы искали конкретный гифт, пишем другое сообщение */}
               <div style={{color:'#ccc', fontSize:'14px', marginBottom:'15px'}}>
                 {giftQuery.toLowerCase().includes('pepe') ? 'Открываем всех Pepe...' : `Всего предметов: ${giftResult.count}`}
               </div>
               
               <a href={giftResult.link} target="_blank" rel="noreferrer" 
                  style={{display:'block', padding:'12px', background:'rgba(0,122,255,0.2)', borderRadius:'12px', color:'#fff', textDecoration:'none', fontWeight:'600'}}>
                  Открыть на Getgems ↗
               </a>
            </div>
          )}
        </div>
      )}

      {/* --- STARS & CALC (Оставляем как были, они работают) --- */}
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
               <div className="result-value" style={{color:'#ffd700'}}>${starsProfit}</div>
             </div>
          )}
        </div>
      )}

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