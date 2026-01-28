import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { paymentsService } from '../services/payments.service';
import { subscriptionsService } from '../services/subscriptions.service';
import type { SubscriptionPlan, SubscriptionStatusSummary, SubscriptionType } from '../types/subscriptions';
import './SubscriptionsPage.css';

type PlanFilter = SubscriptionType | 'all';

const planTabs: { id: PlanFilter; label: string }[] = [
  { id: 'all', label: 'All Plans' },
  { id: 'premium_seller', label: 'Premium Seller' },
  { id: 'premium_buyer', label: 'Premium Buyer' },
  { id: 'featured_listing', label: 'Featured Listing' },
];

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

const buildFeatureList = (features: Record<string, boolean>) =>
  Object.entries(features)
    .filter(([, value]) => value)
    .map(([key]) => key.replace(/_/g, ' '));

export const SubscriptionsPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [status, setStatus] = useState<SubscriptionStatusSummary | null>(null);
  const [activeTab, setActiveTab] = useState<PlanFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [planData, statusData] = await Promise.all([
        paymentsService.getPlans(),
        subscriptionsService.getStatus(),
      ]);
      setPlans(planData || []);
      setStatus(statusData);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load subscription plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredPlans = useMemo(() => {
    if (activeTab === 'all') return plans;
    return plans.filter((plan) => plan.planType === activeTab);
  }, [plans, activeTab]);

  return (
    <div className="subscriptions-page">
      <header className="subscriptions-header">
        <div>
          <h1>Subscriptions & Premium Plans</h1>
          <p>Unlock priority listings, faster mediation, and featured badges.</p>
        </div>
        <div className="subscriptions-header-actions">
          <Link to="/subscriptions/manage" className="subscriptions-secondary-link">
            Manage subscriptions
          </Link>
          <Link to="/payments/history" className="subscriptions-secondary-link">
            Payment history
          </Link>
        </div>
      </header>

      {status && (
        <section className="subscriptions-status">
          <div>
            <h3>Your Premium Status</h3>
            <p>
              Premium Seller: <strong>{status.hasPremiumSeller ? 'Active' : 'Inactive'}</strong>
              {' · '}
              Premium Buyer: <strong>{status.hasPremiumBuyer ? 'Active' : 'Inactive'}</strong>
              {' · '}
              Featured Listing: <strong>{status.hasActiveFeaturedListing ? 'Active' : 'Inactive'}</strong>
            </p>
          </div>
          <div className="subscriptions-status-count">
            Active subscriptions: <strong>{status.activeSubscriptions.length}</strong>
          </div>
        </section>
      )}

      <div className="subscriptions-tabs">
        {planTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div className="subscriptions-loading">Loading plans...</div>}
      {error && <div className="subscriptions-error">{error}</div>}
      {!loading && !error && (
        <div className="subscriptions-grid">
          {filteredPlans.map((plan) => {
            const features = buildFeatureList(plan.features || {});
            return (
              <div key={plan.id} className={`subscription-card ${plan.isFeatured ? 'featured' : ''}`}>
                <div className="subscription-card-header">
                  <h3>{plan.displayName}</h3>
                  {plan.isFeatured && <span className="subscription-badge">Popular</span>}
                </div>
                <p className="subscription-price">
                  {formatCurrency(plan.price, plan.currency)} <span>/{plan.billingPeriod}</span>
                </p>
                {plan.description && <p className="subscription-description">{plan.description}</p>}
                <ul className="subscription-features">
                  {features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="subscription-cta"
                  onClick={() => navigate(`/payments/checkout?planId=${plan.id}`)}
                >
                  Choose plan
                </button>
              </div>
            );
          })}
          {filteredPlans.length === 0 && (
            <div className="subscriptions-empty">No plans available for this category yet.</div>
          )}
        </div>
      )}
    </div>
  );
};
