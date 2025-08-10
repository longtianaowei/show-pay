import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import Widget from './Widget'

const hash = window.location.hash.replace('#/', '')
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {hash === 'widget' ? <Widget /> : <App />}
  </StrictMode>
)
