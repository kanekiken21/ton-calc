// api/donate.js
// Этот код работает на сервере, ключ здесь в безопасности.

export default async function handler(req, res) {
  // Твой ключ CryptoBot
  const API_KEY = '502788:AAaVLL4nMA4Pc9uYFqkBpuqW9BVomUuROTt';

  try {
    // Создаем инвойс на 1 TON (можешь поменять amount: '1' на сколько хочешь)
    const response = await fetch('https://pay.crypt.bot/api/createInvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Crypto-Pay-API-Token': API_KEY
      },
      body: JSON.stringify({
        asset: 'TON',
        amount: '1', // Сумма доната
        description: 'Donation to my TON Calc 💎',
        allow_comments: true,
        expires_in: 3600 // Ссылка живет 1 час
      })
    });

    const data = await response.json();

    if (data.ok) {
      // Отправляем ссылку на оплату обратно в приложение
      res.status(200).json({ url: data.result.pay_url });
    } else {
      console.error('CryptoBot Error:', data);
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}