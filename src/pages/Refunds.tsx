import { Link } from 'react-router-dom';
import LegalPage from '../components/LegalPage';

// ⚠️ Starter template — review before relying on it. Fill in: contact email.
export default function Refunds() {
  return (
    <LegalPage title="Refund & Cancellation Policy" updated="21 June 2026">
      <p>
        This policy explains how to cancel and when you may be entitled to a refund. It forms part of
        our <Link to="/terms">Terms of Service</Link>.
      </p>

      <h2>Cancelling a subscription</h2>
      <ul>
        <li>
          You can cancel at any time from the account menu → <strong>Manage subscription</strong>,
          which opens the Stripe customer portal.
        </li>
        <li>
          Cancelling stops future renewals. You keep Pro access until the end of the period you’ve
          already paid for; it is not cut off immediately.
        </li>
        <li>We do not provide pro-rata refunds for the unused part of a billing period.</li>
      </ul>

      <h2>One-off passes</h2>
      <p>
        One-off passes (e.g. a week’s access) are sold as immediately-available digital content. Once
        access has been granted they are <strong>non-refundable</strong>, except where required by
        law or where the Service was faulty.
      </p>

      <h2>Your statutory cancellation right (UK)</h2>
      <p>
        Consumers normally have a 14-day right to cancel a purchase. However, for digital content
        supplied immediately, that right is lost once supply begins. By purchasing and accessing Pro
        straight away, <strong>you consent to immediate supply and acknowledge you lose the 14-day
        right to cancel</strong>. This does not affect your rights if the Service is faulty or not as
        described.
      </p>

      <h2>Faulty service or billing errors</h2>
      <p>
        If you were charged in error, couldn’t access what you paid for, or the Service was
        materially faulty, contact us at <strong>[CONTACT EMAIL]</strong> and we’ll put it right,
        including a refund where appropriate.
      </p>

      <h2>How to reach us</h2>
      <p>Email <strong>[CONTACT EMAIL]</strong> and include the email address on your account.</p>
    </LegalPage>
  );
}
