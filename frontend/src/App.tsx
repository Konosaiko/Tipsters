import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TipstersPage } from './pages/TipstersPage';
import { TipsterDetailPage } from './pages/TipsterDetailPage';
import { TipsFeedPage } from './pages/TipsFeedPage';
import {
  OverviewPage,
  BetsPage,
  PremiumPage,
  CreateBetPage,
  SettingsPage,
} from './pages/dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<TipsFeedPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/tipsters" element={<TipstersPage />} />
          <Route path="/tipsters/:id" element={<TipsterDetailPage />} />

          {/* Protected Dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OverviewPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/bets"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BetsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/premium"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PremiumPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/create"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CreateBetPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
