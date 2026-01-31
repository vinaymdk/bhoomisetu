import './TermsPage.css';

export const TermsPage = () => {
  return (
    <div className="terms-page">
      <div className="terms-card">
        <h1>Terms and Conditions</h1>
        <p>
          By using BhoomiSetu, you agree to follow all applicable laws and our platform guidelines.
          This page provides a high-level summary of our terms; a full legal version can be
          published here later.
        </p>
        <h2>Account and Access</h2>
        <ul>
          <li>Keep your login credentials private and secure.</li>
          <li>Provide accurate contact information for verification and alerts.</li>
          <li>Report suspicious activity immediately.</li>
        </ul>
        <h2>Listings and Communications</h2>
        <ul>
          <li>Only post properties you are authorized to list.</li>
          <li>Do not share misleading, abusive, or fraudulent content.</li>
          <li>Respect user privacy and communication guidelines.</li>
        </ul>
        <h2>Payments and Subscriptions</h2>
        <ul>
          <li>Subscription benefits are tied to the account that purchased them.</li>
          <li>Payment history is available in your profile and subscriptions area.</li>
        </ul>
        <h2>Updates</h2>
        <p>
          Terms may be updated periodically. Continued use of the platform indicates acceptance of
          the latest version.
        </p>
      </div>
    </div>
  );
};
