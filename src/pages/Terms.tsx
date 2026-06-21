import { Link } from 'react-router-dom';
import LegalPage from '../components/LegalPage';

// ⚠️ Starter template — have someone review before relying on it. Fill in the
// bracketed placeholders: operator legal name, contact email, address.
export default function Terms() {
  return (
    <LegalPage title="Terms of Service" updated="21 June 2026">
      <p>
        These terms govern your use of Quant Interview (the “Service”), operated by{' '}
        <strong>[OPERATOR LEGAL NAME]</strong> (“we”, “us”). By creating an account or using the
        Service you agree to these terms. If you do not agree, please do not use the Service.
      </p>

      <h2>1. What the Service is</h2>
      <p>
        Quant Interview is an educational tool for practising quantitative-trading interview skills:
        games, a question bank, a mock-interview tool, an options course, a CV template and
        application-tracking features. It is provided for study purposes only.
      </p>
      <p>
        <strong>It is not financial, investment, legal or career advice</strong>, and we do not
        guarantee any particular interview, internship or job outcome. Firm names, application
        windows and compensation figures shown are approximate, may be out of date, and are not
        affiliated with or endorsed by the firms mentioned — always verify on the firm’s own site.
      </p>

      <h2>2. Eligibility &amp; accounts</h2>
      <ul>
        <li>You must be at least 16 years old to create an account.</li>
        <li>You are responsible for keeping access to your email (used for sign-in) secure.</li>
        <li>You agree to provide accurate information and not to share your account.</li>
      </ul>

      <h2>3. Subscriptions, passes &amp; payment</h2>
      <ul>
        <li>
          Pro is available as a recurring <strong>subscription</strong> (monthly or annual) or as a
          one-off <strong>pass</strong> (e.g. a week). Prices are shown at checkout.
        </li>
        <li>
          Payments are processed by <strong>Stripe</strong>. We do not see or store your full card
          details.
        </li>
        <li>
          Subscriptions <strong>renew automatically</strong> at the end of each period until
          cancelled. One-off passes do not renew and expire at the end of their term.
        </li>
        <li>
          We may change prices; changes apply to future billing periods, not your current one.
        </li>
      </ul>

      <h2>4. Cancellation &amp; refunds</h2>
      <p>
        You can cancel a subscription at any time from your account; access continues until the end
        of the paid period. See our <Link to="/refunds">Refund &amp; Cancellation Policy</Link> for
        full details, including your statutory rights.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>copy, resell, scrape or redistribute the Service’s content;</li>
        <li>share, circumvent or attempt to bypass the paywall or access controls;</li>
        <li>disrupt, attack or reverse-engineer the Service; or</li>
        <li>use the Service unlawfully.</li>
      </ul>

      <h2>6. Intellectual property</h2>
      <p>
        The Service and its content (excluding your own inputs) belong to us or our licensors. We
        grant you a personal, non-transferable licence to use it for your own interview preparation.
      </p>

      <h2>7. Disclaimers &amp; liability</h2>
      <p>
        The Service is provided “as is”, without warranties of any kind. To the fullest extent
        permitted by law, we are not liable for any indirect or consequential loss, or for outcomes
        of interviews or applications. Nothing in these terms limits liability that cannot be limited
        by law. Our total liability is limited to the amount you paid us in the preceding 12 months.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may suspend or terminate accounts that breach these terms. You may stop using the Service
        at any time.
      </p>

      <h2>9. Changes</h2>
      <p>
        We may update these terms; material changes will be reflected by the “last updated” date.
        Continued use after changes means you accept them.
      </p>

      <h2>10. Governing law &amp; contact</h2>
      <p>
        These terms are governed by the laws of England and Wales. Questions? Contact us at{' '}
        <strong>[CONTACT EMAIL]</strong>.
      </p>
    </LegalPage>
  );
}
