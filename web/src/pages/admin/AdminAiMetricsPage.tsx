import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminAiMetricsResponse } from '../../types/admin';
import './AdminPages.css';

const metricOptions = [
  { value: 'fraud_detection', label: 'Fraud Detection' },
  { value: 'sentiment_analysis', label: 'Sentiment Analysis' },
  { value: 'fake_review_detection', label: 'Fake Review Detection' },
];

export const AdminAiMetricsPage = () => {
  const [data, setData] = useState<AdminAiMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metricType, setMetricType] = useState('fraud_detection');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAiMetrics({ metricType });
      setData(response);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load AI metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [metricType]);

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>AI Metrics</h1>
            <p>Monitor fraud, sentiment, and fake review detection performance.</p>
          </div>
          <div className="admin-actions">
            <select value={metricType} onChange={(e) => setMetricType(e.target.value)}>
              {metricOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button className="admin-action-btn" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {loading && <div className="admin-state">Loading AI metrics...</div>}
        {error && <div className="admin-state admin-error">{error}</div>}

        {data && (
          <div className="admin-card-grid">
            {Object.entries(data.summary || {}).map(([key, value]) => (
              <div className="admin-card" key={key}>
                <span className="admin-card-label">{key.replaceAll('_', ' ')}</span>
                <strong>{String(value)}</strong>
              </div>
            ))}
          </div>
        )}

        {data?.data && data.data.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                {Object.keys(data.data[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, idx) => (
                    <td key={idx}>{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
