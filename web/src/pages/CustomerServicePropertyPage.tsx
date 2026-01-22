import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerService } from '../services/customerService.service';
import type { PendingVerificationProperty, UrgencyLevel } from '../types/customer-service';
import './CustomerServicePropertyPage.css';

const urgencyOptions: { value: UrgencyLevel; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const CustomerServicePropertyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<PendingVerificationProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('normal');
  const [negotiationNotes, setNegotiationNotes] = useState('');
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await customerService.getProperty(id);
      setData(result);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load property details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const latestNote = useMemo(() => data?.verificationNotes?.[0], [data]);

  const submit = async () => {
    if (!id) return;
    if (action === 'reject' && rejectionReason.trim().length < 5) {
      setError('Rejection reason is required (min 5 chars).');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await customerService.verifyProperty({
        propertyId: id,
        urgencyLevel,
        negotiationNotes: negotiationNotes.trim() || undefined,
        remarks: remarks.trim() || undefined,
        action,
        rejectionReason: action === 'reject' ? rejectionReason.trim() : undefined,
      });
      navigate('/cs/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to submit verification.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="cs-property-page">
        <div className="cs-property-container">Loading property...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="cs-property-page">
        <div className="cs-property-container cs-error">{error || 'Property not found.'}</div>
      </div>
    );
  }

  const { property, seller } = data;

  return (
    <div className="cs-property-page">
      <div className="cs-property-container">
        <div className="cs-property-header">
          <div>
            <h1>{property.title}</h1>
            <p>{property.location?.address}</p>
            <p>
              {property.location?.city}, {property.location?.state}
            </p>
          </div>
          <button className="secondary" onClick={() => navigate('/cs/dashboard')}>
            Back to Dashboard
          </button>
        </div>

        <div className="cs-property-grid">
          <section>
            <h2>Property Details</h2>
            <div className="cs-property-meta">
              <div>
                <span className="label">Status</span>
                <span>{property.status.replaceAll('_', ' ')}</span>
              </div>
              <div>
                <span className="label">Price</span>
                <span>₹{property.price.toLocaleString()}</span>
              </div>
              <div>
                <span className="label">Area</span>
                <span>
                  {property.area} {property.areaUnit}
                </span>
              </div>
              <div>
                <span className="label">Listing Type</span>
                <span>{property.listingType}</span>
              </div>
              <div>
                <span className="label">Property Type</span>
                <span>{property.propertyType}</span>
              </div>
              <div>
                <span className="label">Created</span>
                <span>{new Date(property.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {property.images && property.images.length > 0 && (
              <div className="cs-property-images">
                {property.images.map((img) => (
                  <img key={img.id} src={img.imageUrl} alt="property" />
                ))}
              </div>
            )}

            {property.description && (
              <div className="cs-property-description">
                <h3>Description</h3>
                <p>{property.description}</p>
              </div>
            )}
          </section>

          <aside>
            <h2>Seller</h2>
            <div className="cs-seller-card">
              <p>{seller.fullName || 'Unknown'}</p>
              <p>{seller.primaryPhone || 'No phone'}</p>
              <p>{seller.primaryEmail || 'No email'}</p>
            </div>

            {latestNote && (
              <div className="cs-latest-note">
                <h3>Latest Verification Note</h3>
                <p>
                  <strong>Urgency:</strong> {latestNote.urgencyLevel || 'N/A'}
                </p>
                {latestNote.negotiationNotes && (
                  <p>
                    <strong>Negotiation:</strong> {latestNote.negotiationNotes}
                  </p>
                )}
                {latestNote.remarks && (
                  <p>
                    <strong>Remarks:</strong> {latestNote.remarks}
                  </p>
                )}
              </div>
            )}

            <div className="cs-verify-form">
              <h2>Verification</h2>
              <label>
                Action
                <select value={action} onChange={(e) => setAction(e.target.value as 'approve' | 'reject')}>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                </select>
              </label>
              <label>
                Urgency Level
                <select value={urgencyLevel} onChange={(e) => setUrgencyLevel(e.target.value as UrgencyLevel)}>
                  {urgencyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Negotiation Notes
                <textarea value={negotiationNotes} onChange={(e) => setNegotiationNotes(e.target.value)} rows={3} />
              </label>
              <label>
                Remarks
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
              </label>
              {action === 'reject' && (
                <label>
                  Rejection Reason *
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                  />
                </label>
              )}
              {error && <div className="cs-error">{error}</div>}
              <button className="primary" onClick={submit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Verification'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
