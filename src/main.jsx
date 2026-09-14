import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { preloadAllFigures } from './game/preloadFigures.js'

// Nạp trước kho hình SVG để các level hiển thị tức thì
preloadAllFigures()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
