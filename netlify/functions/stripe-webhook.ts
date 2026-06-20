import type { Handler } from '@netlify/functions';
import type Stripe from 'stripe';
import { getStripe, getAdmin, json } from './_shared';

/**
 * Stripe → us. This is the source of truth for entitlement: Stripe tells us
 * what happened, we verify the signature, and we write the result to the
 * `profiles` table with the service-role key (bypassing RLS).
 *
 * IMPORTANT: signature verification needs the *raw* request body, so we use
 * event.body verbatim (decoding base64 if Netlify encoded it).
 */
export const handler: Handler = async (event) => {
  const stripe = getStripe();
  const sig = event.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) return json(400, { error: 'Missing webhook signature/secret.' });

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';

  let evt: Stripe.Event;
  try {
    evt = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    return json(400, { error: `Signature check failed: ${e instanceof Error ? e.message : 'unknown'}` });
  }

  const admin = getAdmin();

  try {
    switch (evt.type) {
      case 'checkout.session.completed': {
        const s = evt.data.object as Stripe.Checkout.Session;
        const userId = (s.metadata?.supabase_user_id || s.client_reference_id) as string | null;
        const customerId = s.customer as string;
        if (!userId) break;

        if (s.mode === 'payment') {
          // One-off pass: extend access from the later of now / existing expiry.
          const days = parseInt(s.metadata?.pass_days || '0', 10) || 0;
          const { data: prof } = await admin
            .from('profiles')
            .select('access_expires_at')
            .eq('id', userId)
            .maybeSingle();
          const existing = prof?.access_expires_at ? new Date(prof.access_expires_at) : null;
          const base = existing && existing > new Date() ? existing : new Date();
          base.setDate(base.getDate() + days);
          await admin
            .from('profiles')
            .update({ stripe_customer_id: customerId, access_expires_at: base.toISOString() })
            .eq('id', userId);
        } else {
          // Subscription: read the sub for status + period end.
          const sub = await stripe.subscriptions.retrieve(s.subscription as string);
          await admin
            .from('profiles')
            .update({
              stripe_customer_id: customerId,
              subscription_status: sub.status,
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            })
            .eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = evt.data.object as Stripe.Subscription;
        await admin
          .from('profiles')
          .update({
            subscription_status: sub.status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_customer_id', sub.customer as string);
        break;
      }

      default:
        break;
    }
    return json(200, { received: true });
  } catch (e) {
    return json(500, { error: e instanceof Error ? e.message : 'Webhook handler failed.' });
  }
};
