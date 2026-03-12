import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CalculatorWidget from './components/CalculatorWidget.jsx'

/**
 * Entry point — mounts the Hidden Profits Calculator widget.
 * Host page only needs: <div id="zeroto1-calculator-root"></div>
 */
function mountWidget() {
  const container = document.getElementById('zeroto1-calculator-root')
  if (!container) {
    console.warn('[ZeroTo1] #zeroto1-calculator-root not found.')
    return
  }
  const root = createRoot(container)
  root.render(
    <StrictMode>
      <CalculatorWidget />
    </StrictMode>
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountWidget)
} else {
  mountWidget()
}
