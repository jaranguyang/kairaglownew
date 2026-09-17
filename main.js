import './style.css'
import { initWormhole } from './wormhole.js'

document.querySelector('#app').innerHTML = `
  <main class="wormhole-container" aria-label="Animated cosmic wormhole">
    <div id="loading">Initializing wormhole</div>
  </main>
`

const container = document.querySelector('.wormhole-container')
initWormhole(container)

const loading = document.querySelector('#loading')
loading.style.opacity = '0'
setTimeout(() => loading.remove(), 650)

