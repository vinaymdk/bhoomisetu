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
import { BuyerRequirementsPage } from './pages/BuyerRequirementsPage';
import { CreateBuyerRequirementPage } from './pages/CreateBuyerRequirementPage';
import { BuyerRequirementDetailsPage } from './pages/BuyerRequirementDetailsPage';
import { BuyerInterestsPage } from './pages/BuyerInterestsPage';
import { SellerInterestsPage } from './pages/SellerInterestsPage';
import { CsMediationPage } from './pages/CsMediationPage';
import { SavedPropertiesPage } from './pages/SavedPropertiesPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AIChatPage } from './pages/AIChatPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SupportChatAdminPage } from './pages/SupportChatAdminPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SubscriptionManagementPage } from './pages/SubscriptionManagementPage';
import { PaymentsHistoryPage } from './pages/PaymentsHistoryPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { CreateReviewPage } from './pages/CreateReviewPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPropertiesPage } from './pages/admin/AdminPropertiesPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';
import { AdminAiMetricsPage } from './pages/admin/AdminAiMetricsPage';
import { AdminCsLogsPage } from './pages/admin/AdminCsLogsPage';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/ai-chat" element={<AIChatPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route
          path="/reviews/new"
          element={
            <ProtectedRoute>
              <CreateReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <SubscriptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/history"
          element={
            <ProtectedRoute>
              <PaymentsHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions/manage"
          element={
            <ProtectedRoute>
              <SubscriptionManagementPage />
            </ProtectedRoute>
          }
        />
        
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
        <Route
          path="/buyer-requirements"
          element={
            <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
              <BuyerRequirementsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/buyer-requirements/new"
          element={
            <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
              <CreateBuyerRequirementPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/buyer-requirements/:id/edit"
          element={
            <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
              <CreateBuyerRequirementPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/mediation/my-interests"
          element={
            <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
              <BuyerInterestsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/mediation/property-interests"
          element={
            <RoleProtectedRoute allowedRoles={['seller', 'agent', 'admin']}>
              <SellerInterestsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/mediation/pending"
          element={
            <RoleProtectedRoute allowedRoles={['customer_service', 'admin']}>
              <CsMediationPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedPropertiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer-requirements/:id"
          element={
            <RoleProtectedRoute allowedRoles={['buyer', 'admin']}>
              <BuyerRequirementDetailsPage />
            </RoleProtectedRoute>
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

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/properties"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminPropertiesPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminReviewsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminPaymentsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/ai-metrics"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminAiMetricsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/admin/cs-logs"
          element={
            <RoleProtectedRoute allowedRoles={['admin']}>
              <AdminCsLogsPage />
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
          path="/cs/support-chat"
          element={
            <RoleProtectedRoute allowedRoles={['customer_service', 'admin']}>
              <SupportChatAdminPage />
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
