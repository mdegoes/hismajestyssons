require('dotenv').config();
const Stripe = require('stripe');

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('Missing STRIPE_SECRET_KEY. Copy .env.example to .env and fill in your key.');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

stripe.balance.retrieve()
  .then((balance) => {
    const mode = secretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST';
    console.log(`Connected to Stripe in ${mode} mode.`);
    console.log('Available balance:', balance.available);
  })
  .catch((err) => {
    console.error('Stripe connection failed:', err.message);
    process.exit(1);
  });
