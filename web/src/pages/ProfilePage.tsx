import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userProfileService } from '../services/userProfile.service';
import './ProfilePage.css';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [primaryEmail, setPrimaryEmail] = useState(user?.primaryEmail || '');
  const [primaryPhone, setPrimaryPhone] = useState(user?.primaryPhone || '');
  const [address, setAddress] = useState((user as any)?.address || '');
  const [avatarUrl, setAvatarUrl] = useState((user as any)?.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  if (!user) {
    return <div className="profile-page">Login to view profile.</div>;
  }

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await userProfileService.updateProfile({
        fullName,
        primaryEmail,
        primaryPhone,
        address,
        avatarUrl,
      });
      await refreshUser();
      setStatus('Profile updated successfully.');
    } catch (err: any) {
      setStatus(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const url = await userProfileService.uploadAvatar(file);
      setAvatarUrl(url);
      setStatus('Avatar updated. Click Save to persist profile data.');
    } catch (err: any) {
      setStatus(err?.response?.data?.message || 'Failed to upload avatar.');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3>Profile Image</h3>
          <div className="profile-avatar">
            <img src={avatarUrl || '/placeholder-property.jpg'} alt="Profile" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])}
            />
          </div>
        </div>

        <div className="profile-card">
          <h3>Personal Information</h3>
          <div className="profile-form">
            <label>Full Name</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <label>Email</label>
            <input
              value={primaryEmail}
              onChange={(e) => setPrimaryEmail(e.target.value)}
              readOnly
              className="read-only"
            />
            <label>Phone</label>
            <input
              value={primaryPhone}
              onChange={(e) => setPrimaryPhone(e.target.value)}
              readOnly
              className="read-only"
            />
            <label>Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
            <button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {status && <div className="profile-status">{status}</div>}
          </div>
        </div>

        <div className="profile-card">
          <h3>Share BhoomiSetu</h3>
          <div className="profile-share">
            <a
              className="share-icon whatsapp"
              href="https://wa.me/?text=BhoomiSetu%20-%20https%3A%2F%2Fbhoomisetu.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Share on WhatsApp"
            >
              <i className="fab fa-whatsapp" />
            </a>
            <a
              className="share-icon facebook"
              href="https://www.facebook.com/sharer/sharer.php?u=https://bhoomisetu.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Share on Facebook"
            >
              <i className="fab fa-facebook-f" />
            </a>
            <a
              className="share-icon twitter"
              href="https://twitter.com/intent/tweet?text=BhoomiSetu&url=https://bhoomisetu.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Share on X"
            >
              <i className="fab fa-twitter" />
            </a>
          </div>
        </div>
      </div>
      <div className="profile-bottom-nav">
        <Link to="/settings">Settings</Link>
        <Link to="/saved">Saved</Link>
        <Link to="/buyer-requirements">Requirements</Link>
      </div>
    </div>
  );
};

