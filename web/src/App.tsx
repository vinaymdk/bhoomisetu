import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { SearchPage } from './pages/SearchPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
