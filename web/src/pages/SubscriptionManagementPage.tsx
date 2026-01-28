import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscriptionsService } from '../services/subscriptions.service';
import type { Subscription } from '../types/subscriptions';
import './SubscriptionManagementPage.css';

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

export const SubscriptionManagementPage = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionsService.getUserSubscriptions();
      setSubscriptions(data || []);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const toggleAutoRenewal = async (subscription: Subscription) => {
    try {
      const updated = await subscriptionsService.updateAutoRenewal(
        subscription.id,
        !subscription.autoRenewalEnabled,
      );
      setSubscriptions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to update auto-renewal.');
    }
  };

  const cancelSubscription = async (subscription: Subscription) => {
    if (!window.confirm('Cancel this subscription?')) return;
    try {
      const updated = await subscriptionsService.cancelSubscription(subscription.id);
      setSubscriptions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to cancel subscription.');
    }
  };

  return (
    <div className="subscription-management-page">
      <header className="subscription-management-header">
        <div>
          <h1>Manage Subscriptions</h1>
          <p>Control auto-renewal, view expiry dates, and cancel if needed.</p>
        </div>
        <div className="subscription-management-links">
          <Link to="/subscriptions">View plans</Link>
          <Link to="/payments/history">Payment history</Link>
        </div>
      </header>

      {loading && <div className="subscription-management-loading">Loading subscriptions...</div>}
      {error && <div className="subscription-management-error">{error}</div>}

      {!loading && !error && (
        <div className="subscription-management-list">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="subscription-management-card">
              <div>
                <h3>{subscription.plan?.displayName || subscription.subscriptionType}</h3>
                <p className="subscription-management-meta">
                  Status: <strong>{subscription.status}</strong> · Expires: {formatDate(subscription.expiresAt)}
                </p>
              </div>
              <div className="subscription-management-actions">
                <button type="button" onClick={() => toggleAutoRenewal(subscription)}>
                  {subscription.autoRenewalEnabled ? 'Disable auto-renewal' : 'Enable auto-renewal'}
                </button>
                <button type="button" className="danger" onClick={() => cancelSubscription(subscription)}>
                  Cancel subscription
                </button>
              </div>
            </div>
          ))}
          {subscriptions.length === 0 && (
            <div className="subscription-management-empty">No active subscriptions found.</div>
          )}
        </div>
      )}
    </div>
  );
};
