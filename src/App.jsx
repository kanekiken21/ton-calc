import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('flip') // 'flip' или 'stars'
  
  // Данные для Flip
  const [buyPrice, setBuyPrice] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [flipProfit, setFlipProfit] = useState(null)

  // Данные для Stars
  const [starsAmount, setStarsAmount] = useState('')
  const [starsProfit, setStarsProfit] = useState(null)

  // Настройка Телеграма при запуске
  useEffect(() => {
    // Красим шапку в черный цвет, чтобы убрать белую полосу
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.setHeaderColor('#1a202c'); 
      window.Telegram.WebApp.expand(); // Раскрыть на весь экран
    }
  }, [])

  // Логика Flip
  const calculateFlip = () => {
    const buy = parseFloat(buyPrice);
    const sell = parseFloat(sellPrice);
    if (isNaN(buy) || isNaN(sell)) return;
    const fee = sell * 0.10; // 10% комиссия
    setFlipProfit((sell - fee - buy).toFixed(2));
  }

  // Логика Stars (Курс примерно 0.013$ за звезду)
  const calculateStars = () => {
    const amount = parseFloat(starsAmount);
    if (isNaN(amount)) return;
    
    // Примерный курс вывода (меняется, но возьмем средний)
    const rateUsd = 0.013; 
    const totalUsd = amount * rateUsd;
    
    setStarsProfit(totalUsd.toFixed(2));
  }

  return (
    <div className="glass-card">
      {/* Картинка (если ты закинул star.png в папку public) */}
      <div style={{ marginBottom: '20px' }}>
        <img src="/star.png" alt="Logo" style={{ width: '80px', height: '80px' }} 
             onError={(e) => e.target.style.display = 'none'} /> 
      </div>

      <h1>TON Tools 💎</h1>

      {/* Переключатель вкладок */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'flip' ? 'active' : ''}`}
          onClick={() => setActiveTab('flip')}
        >
          Flip Calc
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stars' ? 'active' : ''}`}
          onClick={() => setActiveTab('stars')}
        >
          Stars Calc
        </button>
      </div>

      {/* Вкладка FLIP */}
      {activeTab === 'flip' && (
        <div className="tab-content fade-in">
          <div className="input-group">
            <label>Купил за (TON)</label>
            <input type="number" className="input-field" placeholder="0.00" 
                   value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} />
          </div>
          <div className="input-group">
            <label>Продаю за (TON)</label>
            <input type="number" className="input-field" placeholder="0.00" 
                   value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateFlip}>Считать профит</button>
          
          {flipProfit !== null && (
            <div className="result-box">
              <div>Чистая прибыль:</div>
              <div className="result-value">{flipProfit} TON</div>
            </div>
          )}
        </div>
      )}

      {/* Вкладка STARS */}
      {activeTab === 'stars' && (
        <div className="tab-content fade-in">
          <p style={{fontSize: '14px', color: '#aaa'}}>Конвертер Telegram Stars в $</p>
          <div className="input-group">
            <label>Количество Звезд ⭐️</label>
            <input type="number" className="input-field" placeholder="1000" 
                   value={starsAmount} onChange={(e) => setStarsAmount(e.target.value)} />
          </div>
          <button className="action-btn" onClick={calculateStars}>Сколько это в $?</button>
          
          {starsProfit !== null && (
            <div className="result-box" style={{background: 'rgba(255, 215, 0, 0.1)', borderColor: 'gold'}}>
              <div>Вы получите примерно:</div>
              <div className="result-value" style={{color: '#ffd700'}}>${starsProfit}</div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default App