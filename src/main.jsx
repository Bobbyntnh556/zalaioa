import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// В Vite этот файл инициализирует приложение, находя элемент с id 'root' в index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)