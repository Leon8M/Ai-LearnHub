// Single source of truth for prices. The server charges and credits from this table, and the
// webhook checks the amount Paystack actually collected against it.
export const CURRENCY = 'KES';

export const TOKEN_PACKAGES = {
  single: { id: 'single', tokens: 1, price: 50, label: 'Buy 1 Token', description: 'Quick top-up for a single course.' },
  starter: { id: 'starter', tokens: 3, price: 100, label: 'Starter Pack', description: 'Great for getting started with multiple courses.' },
  pro: { id: 'pro', tokens: 10, price: 250, label: 'Pro Pack', description: 'For serious learners and content creators.' },
  master: { id: 'master', tokens: 30, price: 500, label: 'Master Pack', description: 'Unlock extensive learning and creation.' },
};

/** Paystack amounts are in the currency's subunit (cents for KES). */
export const amountInSubunits = (pkg) => pkg.price * 100;

export const WEEKLY_TOKEN_AMOUNT = 3;
