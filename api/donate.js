// api/donate.js

export default async function handler(req, res) {
  // Твой ключ (Mainnet)
  const API_KEY = '502788:AAaVLL4nMA4Pc9uYFqkBpuqW9BVomUuROTt';
  
  // URL для Mainnet (для реальных денег)
  const URL = 'https://pay.crypt.bot/api/createInvoice';

  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Crypto-Pay-API-Token': API_KEY
      },
      body: JSON.stringify({
        asset: 'TON',
        amount: '1', // Сумма доната: 1 TON
        description: 'Donation to my TON Calc 💎',
        // allow_comments: true,
        // expires_in: 3600
      })
    });

    const data = await response.json();

    if (data.ok) {
      // Успех! Возвращаем ссылку
      res.status(200).json({ url: data.result.pay_url });
    } else {
      // Ошибка от самого Криптобота (например, ключ не тот)
      console.error('CryptoBot API Error:', data);
      res.status(400).json({ error: data.error?.name || 'CryptoBot Error' });
    }
  } catch (error) {
    // Ошибка сервера/сети
    console.error('Server Internal Error:', error);
    res.status(500).json({ error: error.message });
  }
}