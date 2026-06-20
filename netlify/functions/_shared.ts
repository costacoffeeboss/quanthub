// Shared helpers for the Stripe/Supabase functions. The leading underscore
// keeps Netlify from exposing this file as its own endpoint.
import Stripe from 'stripe';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { HandlerEvent } from '@netlify/functions';

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  return new Stripe(key);
}

/** Service-role Supabase client — bypasses RLS. Server-side only. */
export function getAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Resolve the signed-in user from the Authorization: Bearer <jwt> header. */
export async function getUser(event: HandlerEvent): Promise<User | null> {
  const header = event.headers.authorization || event.headers.Authorization;
  const token = header?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data, error } = await getAdmin().auth.getUser(token);
  if (error) return null;
  return data.user;
}

export const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const SITE_URL = process.env.SITE_URL || 'https://quantinterview.netlify.app';

/** Plan → Stripe price + checkout mode. Prices come from env (never hardcoded). */
export const PLAN_CONFIG: Record<string, { price: string | undefined; mode: 'subscription' | 'payment'; days?: number }> = {
  monthly: { price: process.env.STRIPE_PRICE_MONTHLY, mode: 'subscription' },
  annual: { price: process.env.STRIPE_PRICE_ANNUAL, mode: 'subscription' },
  week: { price: process.env.STRIPE_PRICE_WEEK, mode: 'payment', days: 7 },
  month: { price: process.env.STRIPE_PRICE_MONTH, mode: 'payment', days: 30 },
};
