import LegalPage from '../components/LegalPage';

// ⚠️ Starter template — review before relying on it. Fill in: operator legal
// name, contact email, address. Confirm the processor list matches what you use.
export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="21 June 2026">
      <p>
        This policy explains how Quant Interview, operated by <strong>[OPERATOR LEGAL NAME]</strong>{' '}
        (“we”, “us”), collects and uses your personal data. We are the data controller. For any
        privacy request, contact <strong>[CONTACT EMAIL]</strong>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> your email address (used for sign-in via a one-time code).</li>
        <li>
          <strong>Subscription data:</strong> your plan and status, and a Stripe customer ID. Card
          details are handled by Stripe — <strong>we never receive or store them</strong>.
        </li>
        <li>
          <strong>Usage data stored in your browser:</strong> game scores, course progress and
          tracker notes are kept in your browser’s local storage, not on our servers (unless a future
          feature syncs them, which we’ll update this policy to reflect).
        </li>
        <li><strong>Technical data:</strong> standard logs from our hosting provider.</li>
      </ul>

      <h2>How and why we use it</h2>
      <ul>
        <li>To provide sign-in and your account — legal basis: performance of a contract.</li>
        <li>To process payments and manage your subscription — performance of a contract.</li>
        <li>To keep the Service secure and working — legitimate interests.</li>
        <li>To meet legal and accounting obligations — legal obligation.</li>
      </ul>
      <p>We do not sell your personal data, and we do not use it for third-party advertising.</p>

      <h2>Who we share it with (processors)</h2>
      <ul>
        <li><strong>Supabase</strong> — authentication and database.</li>
        <li><strong>Stripe</strong> — payment processing and subscription management.</li>
        <li><strong>Netlify</strong> — website hosting and serverless functions.</li>
        <li><strong>Resend</strong> — sending sign-in emails.</li>
      </ul>
      <p>Each processes data on our behalf under their own security and privacy terms.</p>

      <h2>Cookies &amp; local storage</h2>
      <p>
        We use your browser’s local storage to remember your sign-in session and your progress. Our
        payment and auth providers may set cookies necessary for those functions. We do not use
        advertising or tracking cookies.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep account and subscription data for as long as you have an account and as required for
        legal/accounting purposes, then delete or anonymise it. You can request deletion at any time.
      </p>

      <h2>Your rights</h2>
      <p>
        Under UK GDPR you have the right to access, correct, delete, restrict or port your data, and
        to object to certain processing. To exercise any of these, email{' '}
        <strong>[CONTACT EMAIL]</strong>. You also have the right to complain to the UK Information
        Commissioner’s Office (ico.org.uk).
      </p>

      <h2>International transfers &amp; security</h2>
      <p>
        Some processors may store data outside the UK/EEA under appropriate safeguards. We take
        reasonable technical measures to protect your data, though no system is perfectly secure.
      </p>

      <h2>Children</h2>
      <p>The Service is not intended for anyone under 16, and we do not knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>We may update this policy; the “last updated” date shows the latest version.</p>
    </LegalPage>
  );
}
