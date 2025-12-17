import { useState, useEffect } from 'react'
import './App.css'

const TONAPI_KEY = 'AE32DKIDFHCHKVIAAAAB4QENGU6O2RLLMSAHL2S6T3C5WTTWEY2JQXXCHF6JVREQCJYMUSI';

function App() {
  const [activeTab, setActiveTab] = useState('flip') 
  
  // State Flip (Используем строки, чтобы не было нулей)
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [royalty, setRoyalty] = useState('5')
  const [flipProfit, setFlipProfit] = useState(null)
  
  // State Stars
  const [starsAmount, setStarsAmount] = useState('')
  const [starsProfit, setStarsProfit] = useState(null)
  
  // State Gifts
  const [giftQuery, setGiftQuery] = useState('')
  const [giftResult, setGiftResult] = useState(null)
  const [loadingGift, setLoadingGift] = useState(false)

  // Общие данные
  const [tonPrice, setTonPrice] = useState(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)

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
    fetchTonPrice(); // Грузим курс при старте
  }, [])

  // Функция загрузки курса (можно вызывать кнопкой)
  const fetchTonPrice = () => {
    setIsLoadingPrice(true);
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=toncoin&vs_currencies=usd')
      .then(res => res.json())
      .then(data => {
        if (data.toncoin?.usd) {
            setTonPrice(data.toncoin.usd);
        } else {
            console.error("Нет данных о курсе");
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoadingPrice(false));
  }

  // --- Logic Flip ---
  const calculateFlip = () => {
    // Если пусто, считаем как 0
    const buy = buyPrice === '' ? 0 : parseFloat(buyPrice); 
    const sell = sellPrice === '' ? 0 : parseFloat(sellPrice);
    const roy = royalty === '' ? 0 : parseFloat(royalty);
    
    // Но если оба поля пусты, ничего не делаем
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

  // --- Logic Gifts (Search Collection) ---
  const searchGift = async () => {
    if (!giftQuery.trim()) return;
    setLoadingGift(true);
    setGiftResult(null);

    try {
      // Ищем КОЛЛЕКЦИЮ
      const response = await fetch(`https://tonapi.io/v2/nfts/collections/search?query=${giftQuery}&limit=1`, {
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
          // Ссылка на Getgems, так как API не ищет предметы по имени
          link: `https://getgems.io/collection/${collection.address}`
        });
      } else {
        alert('Коллекция не найдена. Попробуйте ввести "Gifts" или "Anonymous"');
      }
    } catch (e) {
      alert('Ошибка соединения с TonAPI');
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
        <div style={{display:'flex', justifyContent:'center'}}>
          <div className="price-badge fade-in">
             <span>💎 1 TON ≈ {tonPrice ? `$${tonPrice}` : '---'}</span>
             <button onClick={fetchTonPrice} className="refresh-btn" style={{opacity: isLoadingPrice ? 0.5 : 1}}>
               🔄
             </button>
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
                <label>Купил (TON)</label>
                <input type="number" className="input-field" placeholder="0" 
                       value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
             </div>
             <div className="input-group" style={{width: '90px'}}>
                <label>Royalty %</label>
                <input type="number" className="input-field" placeholder="5" 
                       value={royalty} onChange={(e) => setRoyalty(e.target.value)} 
                       style={{color:'#5ac8fa', borderColor:'rgba(90,200,250,0.2)'}}/>
             </div>
          </div>
          <div className="input-group">
            <label>Продал (TON)</label>
            <input type="number" className="input-field" placeholder="0" 
                   value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateFlip}>Посчитать</button>
          
          {flipProfit !== null && (
            <div className="result-box">
              <div style={{color:'#aaa', fontSize:'13px', marginBottom:'8px'}}>Чистая прибыль</div>
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
          <p style={{fontSize:'14px', color:'#888', marginBottom:'20px'}}>Поиск флора коллекций</p>
          
          <div className="input-group">
            <label>Название коллекции (например: Gifts)</label>
            <input type="text" className="input-field" placeholder="Введите название..." 
                   value={giftQuery} onChange={(e) => setGiftQuery(e.target.value)} />
          </div>
          
          <button className="action-btn" onClick={searchGift} disabled={loadingGift}>
            {loadingGift ? 'Ищем...' : 'Найти'}
          </button>

          {giftResult && (
            <div className="gift-card fade-in">
               {giftResult.image && <img src={giftResult.image} alt="gift" className="gift-img"/>}
               <div style={{fontWeight:'700', fontSize:'20px', marginBottom:'5px'}}>{giftResult.name}</div>
               <div style={{color:'#5ac8fa', fontSize:'14px'}}>Items: {giftResult.count}</div>
               
               <a href={giftResult.link} target="_blank" rel="noreferrer" 
                  style={{display:'block', marginTop:'15px', color:'#007aff', textDecoration:'none', fontWeight:'600'}}>
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
            <label>Количество Звезд ⭐️</label>
            <input type="number" className="input-field" placeholder="0" 
                   value={starsAmount} onChange={(e) => setStarsAmount(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateStars}>Конвертировать</button>
          {starsProfit && (
             <div className="result-box" style={{borderColor:'gold', background:'rgba(255,215,0,0.08)'}}>
               <div style={{color:'#aaa', fontSize:'13px', marginBottom:'8px'}}>Примерно в долларах</div>
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