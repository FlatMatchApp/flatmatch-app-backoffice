import { Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from '@/features/auth/pages/LoginPage'
import RequestsPage from '@/features/publisher-validation/pages/RequestsPage'
import RequestDetailPage from '@/features/publisher-validation/pages/RequestDetailPage'
import RequestHistoryPage from '@/features/publisher-validation/pages/RequestHistoryPage'

import DashboardLayout from '@/layouts/DashboardLayout'

function AppRouter() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas administrativas */}
      <Route element={<DashboardLayout />}>
        <Route path="/requests" element={<RequestsPage />} />

        <Route path="/requests/:id" element={<RequestDetailPage />} />

        <Route
          path="/requests/:id/history"
          element={<RequestHistoryPage />}
        />
      </Route>

      {/* Redirección inicial */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Página inexistente */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default AppRouter