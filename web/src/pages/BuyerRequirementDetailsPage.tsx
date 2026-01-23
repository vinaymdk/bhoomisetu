import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { buyerRequirementsService } from '../services/buyerRequirements.service';
import type { BuyerRequirement, BuyerRequirementMatch } from '../types/buyerRequirement';
import './BuyerRequirementDetailsPage.css';

const statusLabels: Record<string, string> = {
  active: 'Active',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

const formatBudget = (minBudget?: number | null, maxBudget?: number | null, budgetType?: string) => {
  const typeLabel = budgetType === 'rent' ? '/month' : '';
  if (minBudget && maxBudget) return `₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}${typeLabel}`;
  if (maxBudget) return `Up to ₹${maxBudget.toLocaleString()}${typeLabel}`;
  return 'Budget not set';
};

const getRemainingDays = (expiresAt?: string | null) => {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const BuyerRequirementDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState<BuyerRequirement | null>(null);
  const [matches, setMatches] = useState<BuyerRequirementMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);

  const stats = useMemo(() => {
    if (!matches.length) return { topScore: 0, avgScore: 0 };
    const scores = matches.map((m) => m.match.overallMatchScore || 0);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return {
      topScore: Math.max(...scores),
      avgScore: Math.round(avg),
    };
  }, [matches]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [req, matchList] = await Promise.all([
          buyerRequirementsService.getById(id),
          buyerRequirementsService.getMatches(id),
        ]);
        setRequirement(req);
        setMatches(matchList || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to load requirement.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!id) return;
    setStatusSaving(true);
    try {
      const updated = await buyerRequirementsService.update(id, { status });
      setRequirement(updated);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update status.');
    } finally {
      setStatusSaving(false);
    }
  };

  if (loading) {
    return <div className="buyer-req-details-state">Loading requirement...</div>;
  }

  if (error || !requirement) {
    return (
      <div className="buyer-req-details-state error">
        {error || 'Requirement not found.'}
        <button className="outline-btn" onClick={() => navigate('/buyer-requirements')}>
          Back
        </button>
      </div>
    );
  }

  const remainingDays = getRemainingDays(requirement.expiresAt);

  return (
    <div className="buyer-req-details">
      <div className="buyer-req-details-header">
        <div>
          <h1>{requirement.title || `${requirement.propertyDetails.propertyType || 'Property'} Requirement`}</h1>
          <p>{requirement.description || 'No description provided.'}</p>
        </div>
        <div className="buyer-req-details-actions">
          <Link to={`/buyer-requirements/${requirement.id}/edit`} className="outline-btn">
            Edit
          </Link>
          {requirement.status === 'fulfilled' ? (
            <button className="outline-btn" disabled>
              Fulfilled
            </button>
          ) : requirement.status === 'active' ? (
            <button className="outline-btn" disabled={statusSaving} onClick={() => updateStatus('cancelled')}>
              {statusSaving ? 'Saving...' : 'Hold'}
            </button>
          ) : (
            <button className="outline-btn" disabled={statusSaving} onClick={() => updateStatus('active')}>
              {statusSaving ? 'Saving...' : 'Resume'}
            </button>
          )}
          <Link to="/buyer-requirements" className="outline-btn">
            Back to List
          </Link>
        </div>
      </div>

      <div className="buyer-req-details-grid">
        <div className="detail-card">
          <h3>Requirement Overview</h3>
          <div className="detail-row">
            <span>Status</span>
            <span className={`status-pill status-${requirement.status}`}>
              {statusLabels[requirement.status] || requirement.status}
            </span>
          </div>
          <div className="detail-row">
            <span>Location</span>
            <span>
              {requirement.location.locality ? `${requirement.location.locality}, ` : ''}
              {requirement.location.city}, {requirement.location.state}
            </span>
          </div>
          <div className="detail-row">
            <span>Budget</span>
            <span>{formatBudget(requirement.budget.minBudget, requirement.budget.maxBudget, requirement.budget.budgetType)}</span>
          </div>
          <div className="detail-row">
            <span>Property Type</span>
            <span>{requirement.propertyDetails.propertyType || 'Any'}</span>
          </div>
          <div className="detail-row">
            <span>Listing Type</span>
            <span>{requirement.propertyDetails.listingType || 'Any'}</span>
          </div>
          <div className="detail-row">
            <span>Area</span>
            <span>
              {requirement.propertyDetails.minArea || requirement.propertyDetails.maxArea
                ? `${requirement.propertyDetails.minArea || 0} - ${requirement.propertyDetails.maxArea || 'Any'} ${
                    requirement.propertyDetails.areaUnit
                  }`
                : 'Flexible'}
            </span>
          </div>
          <div className="detail-row">
            <span>Bedrooms</span>
            <span>{requirement.propertyDetails.bedrooms ?? 'Any'}</span>
          </div>
          <div className="detail-row">
            <span>Bathrooms</span>
            <span>{requirement.propertyDetails.bathrooms ?? 'Any'}</span>
          </div>
          <div className="detail-row">
            <span>Required Features</span>
            <span>{requirement.propertyDetails.requiredFeatures?.join(', ') || 'Flexible'}</span>
          </div>
        </div>

        <div className="detail-card">
          <h3>Match Performance</h3>
          <div className="detail-row">
            <span>Total Matches</span>
            <span>{matches.length}</span>
          </div>
          <div className="detail-row">
            <span>Top Score</span>
            <span>{stats.topScore.toFixed(0)}%</span>
          </div>
          <div className="detail-row">
            <span>Average Score</span>
            <span>{stats.avgScore}%</span>
          </div>
          <div className="detail-row">
            <span>Last Matched</span>
            <span>{requirement.lastMatchedAt ? new Date(requirement.lastMatchedAt).toLocaleDateString() : 'Not yet'}</span>
          </div>
          <div className="detail-row">
            <span>Expires At</span>
            <span>{requirement.expiresAt ? new Date(requirement.expiresAt).toLocaleDateString() : 'No expiry'}</span>
          </div>
          {requirement.expiresAt && (
            <div className="detail-row">
              <span>Expires In</span>
              <span>{remainingDays && remainingDays > 0 ? `${remainingDays} days` : 'Expired'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="match-section">
        <div className="match-section-header">
          <h2>Matched Properties</h2>
          <p>Listings that match your requirements and budget overlap criteria.</p>
          <p className="match-support-note">
            Our customer service team will connect with you shortly for the best available matches.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="buyer-req-details-state empty">No matches yet. We will notify you when new properties go live.</div>
        ) : (
          <div className="match-grid">
            {matches.map((match) => (
              <div key={match.match.id} className="match-card">
                <div className="match-card-header">
                  <h3>{match.property.title || 'Untitled Property'}</h3>
                  <span className="score-pill">{Math.round(match.match.overallMatchScore)}%</span>
                </div>
                <p className="match-meta">
                  {match.property.locality ? `${match.property.locality}, ` : ''}
                  {match.property.city}, {match.property.state}
                </p>
                <div className="match-row">
                  <div>
                    <span className="label">Price</span>
                    <span className="value">₹{Number(match.property.price).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="label">Area</span>
                    <span className="value">
                      {match.property.area} {match.property.areaUnit}
                    </span>
                  </div>
                </div>
                <div className="match-row">
                  <div>
                    <span className="label">Budget Overlap</span>
                    <span className="value">{Math.round(match.budgetOverlapPercentage)}%</span>
                  </div>
                  <div>
                    <span className="label">Location Match</span>
                    <span className="value">{match.locationMatchType.replace('_', ' ') || 'City'}</span>
                  </div>
                </div>
                <div className="match-reasons">
                  {(match.matchReasons || []).slice(0, 3).map((reason) => (
                    <span key={reason} className="reason-pill">
                      {reason}
                    </span>
                  ))}
                </div>
                <Link className="match-link" to={`/properties/${match.property.id}`}>
                  View Property
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

