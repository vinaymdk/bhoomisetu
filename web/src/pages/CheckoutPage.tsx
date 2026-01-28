import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { paymentsService } from '../services/payments.service';
import type { PaymentGateway, PaymentOrderResponse } from '../types/payments';
import type { SubscriptionPlan } from '../types/subscriptions';
import './CheckoutPage.css';

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

const gatewayOptions: { id: PaymentGateway; label: string }[] = [
  { id: 'razorpay', label: 'Razorpay (simulated)' },
  { id: 'stripe', label: 'Stripe (simulated)' },
];

export const CheckoutPage = () => {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const planId = query.get('planId');
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [gateway, setGateway] = useState<PaymentGateway>('razorpay');
  const [order, setOrder] = useState<PaymentOrderResponse | null>(null);
  const [gatewayPaymentId, setGatewayPaymentId] = useState('');
  const [gatewaySignature, setGatewaySignature] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setError('Missing plan ID. Please select a plan first.');
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await paymentsService.getPlanById(planId);
        setPlan(response);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load plan details.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [planId]);

  const createOrder = async () => {
    if (!planId) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const response = await paymentsService.createPaymentOrder({ planId, gateway });
      setOrder(response);
      setGatewayPaymentId(response.orderId);
      setMessage('Order created. Use the simulated payment ID to verify.');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create payment order.');
    } finally {
      setSubmitting(false);
    }
  };

  const verifyPayment = async () => {
    if (!order) return;
    setSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      await paymentsService.verifyPayment({
        paymentId: order.paymentId,
        gatewayPaymentId: gatewayPaymentId || order.orderId,
        gatewaySignature: gatewaySignature || undefined,
      });
      setMessage('Payment verified and subscription activated.');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Payment verification failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <header className="checkout-header">
        <div>
          <h1>Checkout</h1>
          <p>Complete your subscription using the simulated gateway flow.</p>
        </div>
        <Link to="/subscriptions" className="checkout-back">
          Back to plans
        </Link>
      </header>

      {loading && <div className="checkout-loading">Loading checkout...</div>}
      {error && <div className="checkout-error">{error}</div>}

      {!loading && plan && (
        <div className="checkout-grid">
          <section className="checkout-card">
            <h2>{plan.displayName}</h2>
            <p className="checkout-price">{formatCurrency(plan.price, plan.currency)}</p>
            <p className="checkout-period">{plan.billingPeriod} · {plan.durationDays} days</p>
            {plan.description && <p className="checkout-description">{plan.description}</p>}
            <div className="checkout-actions">
              <label>
                Gateway
                <select value={gateway} onChange={(event) => setGateway(event.target.value as PaymentGateway)}>
                  {gatewayOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" onClick={createOrder} disabled={submitting}>
                Create payment order
              </button>
            </div>
            {order && (
              <div className="checkout-order">
                <h4>Order details</h4>
                <p>Payment ID: {order.paymentId}</p>
                <p>Order ID: {order.orderId}</p>
                <pre>{JSON.stringify(order.orderData, null, 2)}</pre>
              </div>
            )}
          </section>

          <section className="checkout-card">
            <h3>Verify Payment (Simulated)</h3>
            <p>Use the generated order ID as the payment ID to simulate completion.</p>
            <label>
              Gateway payment ID
              <input
                value={gatewayPaymentId}
                onChange={(event) => setGatewayPaymentId(event.target.value)}
                placeholder="pay_simulated_123"
              />
            </label>
            <label>
              Gateway signature (optional)
              <input
                value={gatewaySignature}
                onChange={(event) => setGatewaySignature(event.target.value)}
                placeholder="signature"
              />
            </label>
            <button type="button" onClick={verifyPayment} disabled={!order || submitting}>
              Verify payment
            </button>
            {message && <div className="checkout-success">{message}</div>}
          </section>
        </div>
      )}
    </div>
  );
};
