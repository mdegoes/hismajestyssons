require('dotenv').config();
const Stripe = require('stripe');

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error('Missing STRIPE_SECRET_KEY. See .env.example.');
  process.exit(1);
}

const stripe = new Stripe(secretKey);

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

async function findProductBySlug(slug) {
  const results = await stripe.products.search({ query: `metadata['cc_slug']:'${slug}'` });
  return results.data[0] || null;
}

async function main() {
  const mode = secretKey.startsWith('sk_live_') ? 'LIVE' : 'TEST';
  console.log(`Running in ${mode} mode.\n`);

  const results = [];

  for (const piece of PIECES) {
    const product = await findProductBySlug(piece.slug);
    if (!product) {
      console.log(`${piece.slug}: NO PRODUCT FOUND (metadata cc_slug missing or not copied) — skipped`);
      results.push({ slug: piece.slug, status: 'not_found' });
      continue;
    }

    const newDescription = `His Majesty’s Sons art print. ${piece.scripture}`;

    if (product.description === newDescription) {
      console.log(`${piece.slug}: already up to date`);
      results.push({ slug: piece.slug, product: product.id, status: 'unchanged', description: newDescription });
      continue;
    }

    await stripe.products.update(product.id, { description: newDescription });
    console.log(`${piece.slug}: updated description`);
    results.push({
      slug: piece.slug,
      product: product.id,
      status: 'updated',
      from: product.description || null,
      to: newDescription,
    });
  }

  const fs = require('fs');
  const path = require('path');
  const outPath = path.join(__dirname, 'update-product-descriptions-results.json');
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
