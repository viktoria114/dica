import { StrictMode } from 'react'
import ReactDom from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/index.ts'
import App from './App.tsx'
import './index.css'

ReactDom.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
    <App />
    </Provider>
  </StrictMode>,
)
