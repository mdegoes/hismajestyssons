require('dotenv').config();
const Stripe = require('stripe');

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('Missing STRIPE_SECRET_KEY. See .env.example.');
  process.exit(1);
}
if (!secretKey.startsWith('sk_live_')) {
  console.error('STRIPE_SECRET_KEY is not a live key. This script is meant to inspect live mode.');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const SLUGS = [
  '01-the-church', '02-the-lamb', '03-faithful-servant', '04-all-creation',
  '05-wherever-you-go', '06-throne-of-grace', '07-teach-them', '08-the-grave',
  '09-with-you-always', '10-great-peace', '11-her-children', '12-a-covenant',
];

async function findProductBySlug(slug) {
  const results = await stripe.products.search({ query: `metadata['cc_slug']:'${slug}'` });
  return results.data[0] || null;
}

async function findPaymentLinkForSlug(slug, productId) {
  for await (const pl of stripe.paymentLinks.list({ limit: 100 })) {
    if (pl.metadata && pl.metadata.cc_slug === slug) return pl;
  }
  // fallback: match by line item product, in case metadata wasn't copied
  if (productId) {
    for await (const pl of stripe.paymentLinks.list({ limit: 100 })) {
      const items = await stripe.paymentLinks.listLineItems(pl.id);
      if (items.data.some((li) => li.price && li.price.product === productId)) return pl;
    }
  }
  return null;
}

async function main() {
  const results = [];
  for (const slug of SLUGS) {
    const product = await findProductBySlug(slug);
    if (!product) {
      console.log(`${slug}: NO PRODUCT FOUND (metadata cc_slug missing or not copied)`);
      results.push({ slug, product: null, paymentLink: null });
      continue;
    }
    const paymentLink = await findPaymentLinkForSlug(slug, product.id);
    console.log(`${slug}: product=${product.id} paymentLink=${paymentLink ? paymentLink.url : 'NOT FOUND'}`);
    results.push({ slug, product: product.id, paymentLink: paymentLink ? paymentLink.url : null });
  }

  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(path.join(__dirname, 'live-payment-links.json'), JSON.stringify(results, null, 2));
  console.log('\nWritten to live-payment-links.json');
}

main().catch((err) => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
