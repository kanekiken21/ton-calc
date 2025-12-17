// api/bot.js

export default async function handler(req, res) {
  // 1. ВСТАВЬ СЮДА ТОКЕН БОТА (из @BotFather)
  const TELEGRAM_BOT_TOKEN = '8527165179:AAG4_dILHBZsq98ABQ_YHjYsQnt40KIEEAo'; 
  
  // 2. ВСТАВЬ СЮДА ССЫЛКУ НА ТВОЙ САЙТ (например, https://my-ton-calc.vercel.app)
  const WEB_APP_URL = 'https://ton-calc.vercel.app'; 

  // --- ДАЛЬШЕ КОД НЕ МЕНЯЙ ---
  
  if (req.method !== 'POST') {
    return res.status(200).send('Bot is running');
  }

  try {
    const { message } = req.body;

    // Если сообщения нет или это не текст - игнорируем
    if (!message || !message.text) {
      return res.status(200).send('OK');
    }

    // Если нажали /start
    if (message.text.startsWith('/start')) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: message.chat.id,
          text: "👋 Welcome to my TON Calculator!\n\nCalculate your NFT flip profits, check TON price, and handle fees instantly.\n\n👇 Click the button below to start:",
          reply_markup: {
            inline_keyboard: [
              [
                { 
                  text: "🚀 Open Calculator", 
                  web_app: { url: WEB_APP_URL } 
                }
              ],
              [
                {
                  text: "📢 News Channel",
                  url: "https://t.me/mytoncalculator"
                }
              ]
            ]
          }
        })
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(200).send('Error'); // Всегда отвечаем 200, чтобы Телеграм не спамил повторами
  }
}