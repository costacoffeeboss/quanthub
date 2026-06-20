import type { Handler } from '@netlify/functions';
import { getStripe, getAdmin, getUser, json, SITE_URL, PLAN_CONFIG } from './_shared';

/** POST { plan: 'monthly' | 'annual' | 'week' | 'month' } → { url } */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const user = await getUser(event);
    if (!user) return json(401, { error: 'Please sign in first.' });

    const { plan } = JSON.parse(event.body || '{}') as { plan?: string };
    const cfg = plan ? PLAN_CONFIG[plan] : undefined;
    if (!cfg || !cfg.price) return json(400, { error: 'Unknown or unconfigured plan.' });

    const stripe = getStripe();
    const admin = getAdmin();

    // Find or create the Stripe customer, remembered on the profile.
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    let customerId: string | undefined = profile?.stripe_customer_id ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: cfg.mode,
      customer: customerId,
      line_items: [{ price: cfg.price, quantity: 1 }],
      client_reference_id: user.id,
      allow_promotion_codes: true,
      metadata: {
        supabase_user_id: user.id,
        plan: plan as string,
        pass_days: cfg.days ? String(cfg.days) : '',
      },
      success_url: `${SITE_URL}/resources?checkout=success`,
      cancel_url: `${SITE_URL}/resources?checkout=cancel`,
    });

    return json(200, { url: session.url });
  } catch (e) {
    return json(500, { error: e instanceof Error ? e.message : 'Checkout failed.' });
  }
};
