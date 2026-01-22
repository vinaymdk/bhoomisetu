import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { PublicRoute } from './components/routes/PublicRoute';
import { RoleProtectedRoute } from './components/routes/RoleProtectedRoute';
import { LoginPage } from './components/auth/LoginPage';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { SearchPage } from './pages/SearchPage';
import { CreateListingPage } from './pages/CreateListingPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { EditListingPage } from './pages/EditListingPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { CustomerServiceDashboardPage } from './pages/CustomerServiceDashboardPage';
import { CustomerServicePropertyPage } from './pages/CustomerServicePropertyPage';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route path="/search" element={<SearchPage />} />
        
        {/* Public routes that should redirect if authenticated */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        
        {/* Protected routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Seller/Agent routes */}
        <Route
          path="/list-property"
          element={
            <RoleProtectedRoute allowedRoles={['seller', 'agent']}>
              <CreateListingPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <RoleProtectedRoute allowedRoles={['seller', 'agent']}>
              <MyListingsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/my-listings/:id/edit"
          element={
            <RoleProtectedRoute allowedRoles={['seller', 'agent']}>
              <EditListingPage />
            </RoleProtectedRoute>
          }
        />

        {/* Customer Service routes */}
        <Route
          path="/cs/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={['customer_service', 'admin']}>
              <CustomerServiceDashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/cs/properties/:id"
          element={
            <RoleProtectedRoute allowedRoles={['customer_service', 'admin']}>
              <CustomerServicePropertyPage />
            </RoleProtectedRoute>
          }
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
