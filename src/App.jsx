import { useState } from 'react' // Импортируем "память"
import './App.css'

function App() {
  // Создаем переменные, которые приложение будет "помнить"
  const [buyPrice, setBuyPrice] = useState('') // Цена покупки
  const [sellPrice, setSellPrice] = useState('') // Цена продажи
  const [profit, setProfit] = useState(null)   // Результат (изначально пусто)

  // Функция расчета
  const calculateProfit = () => {
    const buy = parseFloat(buyPrice)
    const sell = parseFloat(sellPrice)

    if (isNaN(buy) || isNaN(sell)) return; // Если не ввели цифры - не считаем

    // Стандартные комиссии в TON (Getgems = 5% + Роялти автору ~5% = итого 10%)
    const feePercent = 10; 
    
    // Считаем комиссию
    const totalFee = sell * (feePercent / 100);
    
    // Чистая прибыль = (Цена продажи - комиссия) - Цена покупки
    const netProfit = (sell - totalFee) - buy;

    setProfit(netProfit.toFixed(2)); // Округляем до 2 знаков
  }

  return (
    <div className="glass-card">
      <h1>TON Flip Calc 💎</h1>
      
      <div className="input-group">
        <label>Цена покупки (TON)</label>
        <input 
          type="number" 
          className="input-field" 
          placeholder="0.00" 
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Цена продажи (TON)</label>
        <input 
          type="number" 
          className="input-field" 
          placeholder="0.00" 
          value={sellPrice}
          onChange={(e) => setSellPrice(e.target.value)}
        />
      </div>

      <button className="action-btn" onClick={calculateProfit}>
        Посчитать профит
      </button>

      {/* Показываем результат только если он есть (не null) */}
      {profit !== null && (
        <div className="result-box" style={{ 
          borderColor: profit >= 0 ? 'rgba(0, 255, 100, 0.3)' : 'rgba(255, 50, 50, 0.3)',
          background: profit >= 0 ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 50, 50, 0.1)' 
        }}>
          <div>Чистая прибыль:</div>
          <div className="result-value" style={{ color: profit >= 0 ? '#4ade80' : '#ff4d4d' }}>
            {profit} TON
          </div>
        </div>
      )}
      
    </div>
  )
}

export default App