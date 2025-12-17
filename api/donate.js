// api/donate.js
export default async function handler(req, res) {
  const API_KEY = '502788:AAaVLL4nMA4Pc9uYFqkBpuqW9BVomUuROTt';
  const URL = 'https://pay.crypt.bot/api/createInvoice';

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Получаем сумму из запроса от приложения
    // Если суммы нет или она кривая, ставим минимум 0.1 TON
    let { amount } = req.body;
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        amount = '0.1';
    }

    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Crypto-Pay-API-Token': API_KEY
      },
      body: JSON.stringify({
        asset: 'TON',
        amount: amount.toString(), // Используем динамическую сумму
        description: `Donation (${amount} TON) to my TON Calc 💎`,
      })
    });

    const data = await response.json();

    if (data.ok) {
      res.status(200).json({ url: data.result.pay_url });
    } else {
      console.error('CryptoBot API Error:', data);
      res.status(400).json({ error: data.error?.name || 'CryptoBot Error' });
    }
  } catch (error) {
    console.error('Server Internal Error:', error);
    res.status(500).json({ error: error.message });
  }
}