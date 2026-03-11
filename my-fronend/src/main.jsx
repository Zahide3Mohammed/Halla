import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { LanguageProvider } from './Elementes/LanguageContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider >
    <LanguageProvider>
      <App />
    </LanguageProvider>
    </AuthProvider>
  </StrictMode>
)
