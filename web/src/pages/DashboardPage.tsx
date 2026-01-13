import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

export const DashboardPage = () => {
  const { user, roles } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-welcome">
          <p>Welcome back, <strong>{user?.fullName}</strong>!</p>
          <p>Your roles: {roles.join(', ')}</p>
        </div>
        <div className="dashboard-content">
          <p>Dashboard content coming soon...</p>
        </div>
      </div>
    </div>
  );
};
