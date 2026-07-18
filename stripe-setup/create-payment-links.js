require('dotenv').config();
const Stripe = require('stripe');

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('Missing STRIPE_SECRET_KEY. See .env.example.');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

const SITE_ORIGIN = 'https://crownandcalling.org';
const UNIT_AMOUNT = 1295; // $12.95
const CURRENCY = 'usd';
const SHIPPING_AMOUNT = 695; // $6.95
const SHIPPING_RATE_NAME = 'Standard Shipping (US)';

const PIECES = [
  { slug: '01-the-church', title: 'The Church', scripture: '"…the church of the living God, a pillar and buttress of the truth." — 1 Timothy 3:15' },
  { slug: '02-the-lamb', title: 'The Lamb', scripture: '"…he crouched as a lion and as a lioness; who dares rouse him?" — Genesis 49:9' },
  { slug: '03-faithful-servant', title: 'Faithful Servant', scripture: '"Let the elders who rule well be considered worthy of double honor, especially those who labor in preaching and teaching." — 1 Timothy 5:17' },
  { slug: '04-all-creation', title: 'All Creation', scripture: '"For his invisible attributes, namely, his eternal power and divine nature, have been clearly perceived, ever since the creation of the world." — Romans 1:20' },
  { slug: '05-wherever-you-go', title: 'Wherever You Go', scripture: '"Be strong and courageous… for the LORD your God is with you wherever you go." — Joshua 1:9' },
  { slug: '06-throne-of-grace', title: 'Throne of Grace', scripture: '"Let us then with confidence draw near to the throne of grace, that we may receive mercy and find grace to help in time of need." — Hebrews 4:16' },
  { slug: '07-teach-them', title: 'Teach Them', scripture: '"You shall teach them diligently to your children, and shall talk of them when you sit in your house, and when you walk by the way." — Deuteronomy 6:7' },
  { slug: '08-the-grave', title: 'The Grave', scripture: '"You make known to me the path of life; in your presence there is fullness of joy; at your right hand are pleasures forevermore." — Psalm 16:11' },
  { slug: '09-with-you-always', title: 'With You Always', scripture: '"And behold, I am with you always, to the end of the age." — Matthew 28:20' },
  { slug: '10-great-peace', title: 'Great Peace', scripture: '"All your children shall be taught by the Lord, and great shall be the peace of your children." — Isaiah 54:13' },
  { slug: '11-her-children', title: 'Her Children', scripture: '"Her children rise up and call her blessed; her husband also, and he praises her." — Proverbs 31:28' },
  { slug: '12-a-covenant', title: 'A Covenant', scripture: '"I will remember my covenant that is between me and you and every living creature of all flesh." — Genesis 9:15' },
];

async function findExistingProduct(slug) {
  const results = await stripe.products.search({ query: `metadata['cc_slug']:'${slug}'` });
  return results.data[0] || null;
}

async function findExistingPrice(productId) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 10 });
  return prices.data.find((p) => p.unit_amount === UNIT_AMOUNT && p.currency === CURRENCY) || null;
}

async function findExistingPaymentLink(slug) {
  let link = null;
  for await (const pl of stripe.paymentLinks.list({ limit: 100 })) {
    if (pl.metadata && pl.metadata.cc_slug === slug) { link = pl; break; }
  }
  return link;
}

async function getOrCreateShippingRate() {
  for await (const rate of stripe.shippingRates.list({ limit: 100 })) {
    if (rate.display_name === SHIPPING_RATE_NAME && rate.active) return rate;
  }
  return stripe.shippingRates.create({
    display_name: SHIPPING_RATE_NAME,
    type: 'fixed_amount',
    fixed_amount: { amount: SHIPPING_AMOUNT, currency: CURRENCY },
  });
}

async function main() {
  const shippingRate = await getOrCreateShippingRate();
  console.log(`Shipping rate: ${shippingRate.id} ($${(SHIPPING_AMOUNT / 100).toFixed(2)})`);

  const results = [];

  for (const piece of PIECES) {
    let product = await findExistingProduct(piece.slug);
    if (!product) {
      product = await stripe.products.create({
        name: `${piece.title} — 18×24 Print`,
        description: `Crown & Calling art print. ${piece.scripture}`,
        images: [`${SITE_ORIGIN}/crown-n-calling-art/${piece.slug}.jpg`],
        metadata: { cc_slug: piece.slug },
      });
      console.log(`Created product for ${piece.slug}: ${product.id}`);
    } else {
      console.log(`Reusing existing product for ${piece.slug}: ${product.id}`);
    }

    let price = await findExistingPrice(product.id);
    if (!price) {
      price = await stripe.prices.create({
        product: product.id,
        unit_amount: UNIT_AMOUNT,
        currency: CURRENCY,
      });
      console.log(`Created price for ${piece.slug}: ${price.id}`);
    } else {
      console.log(`Reusing existing price for ${piece.slug}: ${price.id}`);
    }

    let link = await findExistingPaymentLink(piece.slug);
    if (!link) {
      link = await stripe.paymentLinks.create({
        line_items: [{ price: price.id, quantity: 1, adjustable_quantity: { enabled: true, minimum: 1, maximum: 10 } }],
        shipping_address_collection: { allowed_countries: ['US'] },
        shipping_options: [{ shipping_rate: shippingRate.id }],
        metadata: { cc_slug: piece.slug },
      });
      console.log(`Created payment link for ${piece.slug}: ${link.url}`);
    } else {
      console.log(`Reusing existing payment link for ${piece.slug}: ${link.url}`);
    }

    results.push({ slug: piece.slug, title: piece.title, url: link.url });
  }

  const fs = require('fs');
  const path = require('path');
  const outPath = path.join(__dirname, 'payment-links.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

  console.log('\n--- Summary ---');
  for (const r of results) console.log(`${r.slug}: ${r.url}`);
  console.log(`\nWritten to ${outPath}`);
}

main().catch((err) => {
  console.error('Script failed:', err.message);
  process.exit(1);
});
