import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const isAdmin = location.pathname.replace(/\/+$/, '') === '/admin'
const Page = lazy(() => (isAdmin ? import('./admin/Admin.tsx') : import('./App.tsx')))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  </StrictMode>,
)
