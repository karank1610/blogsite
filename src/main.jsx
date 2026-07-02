import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { StrictMode } from 'react'

createRoot(document.getElementById('root')).render(
   <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
)
