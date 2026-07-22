require('dotenv').config();
const Stripe = require('stripe');

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('Missing STRIPE_SECRET_KEY. See .env.example.');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const SITE_ORIGIN = 'https://hismajestyssons.com';

const SLUGS = [
  '01-the-church', '02-the-lamb', '03-faithful-servant', '04-all-creation',
  '05-wherever-you-go', '06-throne-of-grace', '07-teach-them', '08-the-grave',
  '09-with-you-always', '10-great-peace', '11-her-children', '12-a-covenant',
];

async function findProductBySlug(slug) {
  const results = await stripe.products.search({ query: `metadata['cc_slug']:'${slug}'` });
  return results.data[0] || null;
}

async function main() {
  const mode = secretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST';
  console.log(`Running in ${mode} mode.\n`);

  const results = [];

  for (const slug of SLUGS) {
    const product = await findProductBySlug(slug);
    if (!product) {
      console.log(`${slug}: NO PRODUCT FOUND (metadata cc_slug missing or not copied) — skipped`);
      results.push({ slug, status: 'not_found' });
      continue;
    }

    const newImageUrl = `${SITE_ORIGIN}/hms-art/${slug}.jpg`;
    const currentImageUrl = product.images && product.images[0];

    if (currentImageUrl === newImageUrl) {
      console.log(`${slug}: already up to date (${newImageUrl})`);
      results.push({ slug, product: product.id, status: 'unchanged', imageUrl: newImageUrl });
      continue;
    }

    await stripe.products.update(product.id, { images: [newImageUrl] });
    console.log(`${slug}: updated ${currentImageUrl || '(no image)'} -> ${newImageUrl}`);
    results.push({ slug, product: product.id, status: 'updated', from: currentImageUrl || null, to: newImageUrl });
  }

  const fs = require('fs');
  const path = require('path');
  const outPath = path.join(__dirname, 'update-product-images-results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  console.log('\n--- Summary ---');
  const updated = results.filter((r) => r.status === 'updated').length;
  const unchanged = results.filter((r) => r.status === 'unchanged').length;
  const notFound = results.filter((r) => r.status === 'not_found').length;
  console.log(`Updated: ${updated}, Already correct: ${unchanged}, Not found: ${notFound}`);
  console.log(`Written to ${outPath}`);
}

main().catch((err) => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
