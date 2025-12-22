import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// Импортируем провайдер
import { TonConnectUIProvider } from '@tonconnect/ui-react'

// URL твоего манифеста (обычно это tonconnect-manifest.json в папке public)
// Если его нет, используй пока временную ссылку или создай файл.
const manifestUrl = 'https://raw.githubusercontent.com/ton-community/tutorials/main/03-client/test/public/tonconnect-manifest.json';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <App />
    </TonConnectUIProvider>
  </React.StrictMode>,
)