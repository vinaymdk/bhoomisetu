import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentsService } from '../services/payments.service';
import type { Payment, PaymentsListResponse } from '../types/payments';
import './PaymentsHistoryPage.css';

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—');

const formatPurpose = (value: string) => value.replace(/_/g, ' ');

export const PaymentsHistoryPage = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (nextPage: number = 1, append: boolean = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response: PaymentsListResponse = await paymentsService.getPayments(nextPage, 10);
      setPayments((prev) => (append ? [...prev, ...response.payments] : response.payments));
      setPage(response.page);
      setTotal(response.total);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load payment history.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const hasMore = payments.length < total;

  return (
    <div className="payments-history-page">
      <header className="payments-history-header">
        <div>
          <h1>Payment History</h1>
          <p>Track your subscription payments and transaction status updates.</p>
        </div>
        <div className="payments-history-links">
          <Link to="/subscriptions">View plans</Link>
          <Link to="/subscriptions/manage">Manage subscriptions</Link>
        </div>
      </header>

      {loading && <div className="payments-history-loading">Loading payments...</div>}
      {error && <div className="payments-history-error">{error}</div>}

      {!loading && !error && (
        <div className="payments-history-list">
          {payments.map((payment) => (
            <div key={payment.id} className="payments-history-card">
              <div>
                <h3>{formatPurpose(payment.purpose)}</h3>
                <p className="payments-history-meta">
                  Status: <span className={`status ${payment.status}`}>{payment.status}</span>
                  {' · '}
                  Gateway: {payment.gateway}
                  {' · '}
                  {formatDate(payment.createdAt)}
                </p>
                <p className="payments-history-id">Payment ID: {payment.id}</p>
              </div>
              <div className="payments-history-amount">
                {formatCurrency(Number(payment.amount), payment.currency)}
              </div>
            </div>
          ))}
          {payments.length === 0 && (
            <div className="payments-history-empty">No payments recorded yet.</div>
          )}
        </div>
      )}

      {!loading && !error && hasMore && (
        <button
          type="button"
          className="payments-history-load-more"
          onClick={() => load(page + 1, true)}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
};
