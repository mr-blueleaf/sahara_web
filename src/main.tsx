import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const isAdmin = location.pathname.replace(/\/+$/, '') === '/admin'
const Page = isAdmin ? lazy(() => import('./admin/Admin.tsx')) : lazy(() => import('./App.tsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={null}>
      <Page />
    </Suspense>
  </StrictMode>,
)
