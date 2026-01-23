import { useEffect, useState } from 'react';
import { mediationService } from '../services/mediation.service';
import type { InterestExpression } from '../types/mediation';
import './MediationPages.css';

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  cs_reviewing: 'CS Reviewing',
  seller_checking: 'Seller Checking',
  approved: 'Approved',
  rejected: 'Rejected',
  connected: 'Connected',
};

export const CsMediationPage = () => {
  const [items, setItems] = useState<InterestExpression[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await mediationService.getPendingInterests({
        connectionStatus: status || undefined,
        page: 1,
        limit: 20,
      });
      setItems(resp.interests || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load pending interests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [status]);

  const handleBuyerReview = async (item: InterestExpression) => {
    await mediationService.reviewBuyerSeriousness({
      interestExpressionId: item.id,
      actionType: 'buyer_seriousness_check',
      buyerSeriousnessScore: Number(scores[item.id] || 0),
      buyerSeriousnessNotes: notes[item.id],
      outcome: 'approved',
      notes: notes[item.id],
    });
    await load();
  };

  const handleSellerCheck = async (item: InterestExpression) => {
    await mediationService.reviewSellerWillingness({
      interestExpressionId: item.id,
      actionType: 'seller_willingness_check',
      sellerWillingnessScore: Number(scores[item.id] || 0),
      sellerWillingnessNotes: notes[item.id],
      outcome: 'approved',
      notes: notes[item.id],
    });
    await load();
  };

  const handleApprove = async (item: InterestExpression) => {
    await mediationService.approveConnection({
      interestExpressionId: item.id,
      revealSellerContact: true,
      revealBuyerContact: true,
      notes: notes[item.id],
    });
    await load();
  };

  const handleReject = async (item: InterestExpression) => {
    await mediationService.rejectConnection(item.id, notes[item.id]);
    await load();
  };

  return (
    <div className="mediation-page">
      <div className="mediation-header">
        <div>
          <h1>Mediation Queue</h1>
          <p>Review buyer seriousness, seller willingness, and approve connections.</p>
        </div>
        <div className="mediation-filter">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Pending</option>
            {Object.keys(statusLabels).map((key) => (
              <option key={key} value={key}>
                {statusLabels[key]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="mediation-state">Loading mediation queue...</div>}
      {!loading && error && <div className="mediation-state error">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="mediation-state empty">No pending mediation tasks.</div>
      )}

      <div className="mediation-grid">
        {items.map((item) => (
          <div key={item.id} className="mediation-card">
            <div className="mediation-card-header">
              <h3>{item.property?.title || 'Property'}</h3>
              <span className={`status-pill status-${item.connectionStatus}`}>
                {statusLabels[item.connectionStatus] || item.connectionStatus}
              </span>
            </div>
            <p className="mediation-meta">
              Buyer: {item.buyer?.fullName || item.buyerId} • Priority: {item.priority}
            </p>
            <div className="mediation-row">
              <span>Interest Type</span>
              <span>{item.interestType}</span>
            </div>
            <textarea
              className="mediation-textarea"
              placeholder="Notes / reason"
              value={notes[item.id] || ''}
              onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
            />
            <input
              className="mediation-input"
              type="number"
              min="0"
              max="100"
              placeholder="Score (0-100)"
              value={scores[item.id] || ''}
              onChange={(e) => setScores({ ...scores, [item.id]: e.target.value })}
            />
            <div className="mediation-actions">
              <button onClick={() => handleBuyerReview(item)}>Buyer Seriousness</button>
              <button onClick={() => handleSellerCheck(item)}>Seller Willingness</button>
              <button className="primary" onClick={() => handleApprove(item)}>
                Approve
              </button>
              <button className="danger" onClick={() => handleReject(item)}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

