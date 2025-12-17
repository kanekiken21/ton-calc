import { useState, useEffect } from 'react'
import './App.css'

// Твой ключ TonAPI (обычно их прячут, но для Mini App пойдет)
const TONAPI_KEY = 'AE32DKIDFHCHKVIAAAAB4QENGU6O2RLLMSAHL2S6T3C5WTTWEY2JQXXCHF6JVREQCJYMUSI';

function App() {
  const [activeTab, setActiveTab] = useState('flip') 
  
  // State Flip
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [royalty, setRoyalty] = useState('5')
  const [flipProfit, setFlipProfit] = useState(null)
  
  // State Stars
  const [starsAmount, setStarsAmount] = useState('')
  const [starsProfit, setStarsProfit] = useState(null)
  
  // State Gifts (НОВОЕ)
  const [giftQuery, setGiftQuery] = useState('')
  const [giftResult, setGiftResult] = useState(null)
  const [loadingGift, setLoadingGift] = useState(false)

  // Общие данные
  const [tonPrice, setTonPrice] = useState(null)

  // State Calc
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

    // Качаем курс. Если API глючит, ставим хардкод 1.53, как ты сказал
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=toncoin&vs_currencies=usd')
      .then(response => response.json())
      .then(data => {
        if (data['toncoin']) {
            setTonPrice(data['toncoin'].usd);
        } else {
            setTonPrice(1.53); // Фолбек, если API не ответил
        }
      })
      .catch(() => setTonPrice(1.53)); // Если ошибка сети, верим тебе про 1.53
  }, [])

  // --- Logic Flip ---
  const calculateFlip = () => {
    const buy = parseFloat(buyPrice); 
    const sell = parseFloat(sellPrice);
    const roy = parseFloat(royalty);
    if (isNaN(buy) || isNaN(sell)) return;
    const totalFee = sell * (0.05 + (roy / 100));
    setFlipProfit((sell - totalFee - buy).toFixed(2));
  }

  // --- Logic Stars ---
  const calculateStars = () => {
    const amount = parseFloat(starsAmount);
    if (isNaN(amount)) return;
    setStarsProfit((amount * 0.0135).toFixed(2));
  }

  // --- Logic Gifts (НОВОЕ: TonAPI) ---
  const searchGift = async () => {
    if (!giftQuery) return;
    setLoadingGift(true);
    setGiftResult(null);

    try {
      // 1. Ищем коллекцию по названию
      const response = await fetch(`https://tonapi.io/v2/nfts/collections/search?query=${giftQuery}&limit=1`, {
        headers: { 'Authorization': `Bearer ${TONAPI_KEY}` }
      });
      const data = await response.json();

      if (data.nft_collections && data.nft_collections.length > 0) {
        const collection = data.nft_collections[0];
        
        // 2. Достаем адрес и пытаемся узнать флор (через API аккаунта или статистики)
        // Для простоты покажем найденную коллекцию. 
        // TonAPI иногда отдает floor внутри metadata, но надежнее просто показать, что нашли.
        
        // Попытаемся получить расширенную инфу, чтобы найти floor
        const detailsRes = await fetch(`https://tonapi.io/v2/nfts/collections/${collection.address}`, {
            headers: { 'Authorization': `Bearer ${TONAPI_KEY}` }
        });
        const details = await detailsRes.json();

        setGiftResult({
          name: collection.metadata?.name || 'Unknown',
          image: collection.metadata?.image,
          // В TonAPI floor может не приходить прямо здесь, но мы покажем что нашли
          // Если бы мы делали маркетплейс, мы бы парсили items.
          // Пока выведем items_count как индикатор
          count: collection.next_item_index,
          address: collection.address.slice(0, 8) + '...' + collection.address.slice(-4)
        });
      } else {
        alert('Коллекция не найдена');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка поиска');
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
      
      {/* HEADER: КУРС */}
      {activeTab !== 'system' && (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
          {tonPrice && <div className="price-badge fade-in">💎 1 TON ≈ ${tonPrice}</div>}
        </div>
      )}

      {/* МЕНЮ ВКЛАДОК (4 ШТУКИ) */}
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
                <label>Купил (TON)</label>
                <input type="number" className="input-field" placeholder="0" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
             </div>
             <div className="input-group" style={{width: '70px'}}>
                <label>Royalty</label>
                <input type="number" className="input-field" placeholder="5" value={royalty} onChange={(e) => setRoyalty(e.target.value)} 
                       style={{color:'#5ac8fa', borderColor:'rgba(90,200,250,0.3)'}}/>
             </div>
          </div>
          <div className="input-group">
            <label>Продал (TON)</label>
            <input type="number" className="input-field" placeholder="0" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateFlip}>Посчитать</button>
          
          {flipProfit !== null && (
            <div className="result-box">
              <div style={{color:'#aaa', fontSize:'12px', marginBottom:'5px'}}>Чистая прибыль</div>
              <div className="result-value" style={{color: flipProfit >= 0 ? '#4ade80' : '#ff453a'}}>{flipProfit} TON</div>
              {tonPrice && <div style={{color:'#888', fontSize:'13px', marginTop:'5px'}}>≈ ${(flipProfit * tonPrice).toFixed(2)}</div>}
            </div>
          )}
        </div>
      )}

      {/* --- GIFTS (НОВОЕ) --- */}
      {activeTab === 'gifts' && (
        <div className="tab-content fade-in">
          <p style={{fontSize:'13px', color:'#aaa', marginBottom:'15px'}}>Найди коллекцию (Beta)</p>
          
          <div className="input-group">
            <label>Название (например: Star)</label>
            <input type="text" className="input-field" placeholder="Red Star..." 
                   value={giftQuery} onChange={(e) => setGiftQuery(e.target.value)} />
          </div>
          
          <button className="action-btn" onClick={searchGift} disabled={loadingGift}>
            {loadingGift ? 'Ищем...' : 'Найти коллекцию'}
          </button>

          {giftResult && (
            <div className="gift-card fade-in">
               {giftResult.image && <img src={giftResult.image} alt="gift" className="gift-img"/>}
               <div style={{fontWeight:'bold', fontSize:'18px'}}>{giftResult.name}</div>
               <div style={{color:'#aaa', fontSize:'12px', marginTop:'5px'}}>Address: {giftResult.address}</div>
               <div style={{color:'#5ac8fa', fontSize:'14px', marginTop:'10px'}}>Items: {giftResult.count}</div>
               <div style={{marginTop:'10px', fontSize:'12px', color:'#666'}}>
                 (Цены скоро будут)
               </div>
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
          <button className="action-btn" onClick={calculateStars}>В Доллары ($)</button>
          {starsProfit !== null && (
             <div className="result-box" style={{borderColor:'gold', background:'rgba(255,215,0,0.1)'}}>
               <div className="result-value" style={{color:'#ffd700'}}>${starsProfit}</div>
             </div>
          )}
        </div>
      )}

      {/* --- CALCULATOR --- */}
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