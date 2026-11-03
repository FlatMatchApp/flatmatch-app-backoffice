import { Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from '@/features/auth/pages/LoginPage'
import RequestsPage from '@/features/publisher-validation/pages/RequestsPage'
import RequestDetailPage from '@/features/publisher-validation/pages/RequestDetailPage'
import RequestHistoryPage from '@/features/publisher-validation/pages/RequestHistoryPage'

import DashboardLayout from '@/layouts/DashboardLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'
import { useAuth } from '@/features/auth/hooks/useAuth'

function AppRouter() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas administrativas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/requests" element={<RequestsPage />} />

          <Route path="/requests/:id" element={<RequestDetailPage />} />

          <Route path="/requests/:id/history" element={<RequestHistoryPage />} />
          <Route path="/history" element={<Navigate to="/requests" replace />} />
        </Route>
      </Route>

      {/* Redirección inicial */}
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? '/requests' : '/login'} replace />
        }
      />

      {/* Página inexistente */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRouter