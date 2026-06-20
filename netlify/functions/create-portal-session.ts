import type { Handler } from '@netlify/functions';
import { getStripe, getAdmin, getUser, json, SITE_URL } from './_shared';

/** POST {} → { url } — opens the Stripe Customer Portal for the signed-in user. */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const user = await getUser(event);
    if (!user) return json(401, { error: 'Please sign in first.' });

    const admin = getAdmin();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) return json(400, { error: 'No billing account yet.' });

    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${SITE_URL}/`,
    });
    return json(200, { url: session.url });
  } catch (e) {
    return json(500, { error: e instanceof Error ? e.message : 'Portal failed.' });
  }
};
