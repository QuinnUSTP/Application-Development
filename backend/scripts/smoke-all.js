/**
 * Run all smoke scripts sequentially.
 *
 * Usage:
 *   node scripts/smoke-all.js
 */

const { spawn } = require('child_process');
const path = require('path');

const scripts = [
  'smoke-auth.js',
  'smoke-admin.js',
  'smoke-address.js',
  'smoke-cart.js',
  'smoke-checkout-cart.js',
  'smoke-receipt-archive.js',
];

function runNode(script) {
  return new Promise((resolve, reject) => {
    const abs = path.join(__dirname, script);
    const child = spawn(process.execPath, [abs], {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} failed with exit code ${code}`));
    });

    child.on('error', reject);
  });
}

(async () => {
  for (const s of scripts) {
    console.log(`\n=== Running ${s} ===`);
    await runNode(s);
  }
  console.log('\n✅ All smoke scripts passed');
})().catch((err) => {
  console.error('\n❌ Smoke suite failed');
  console.error(err?.message || err);
  process.exitCode = 1;
});
