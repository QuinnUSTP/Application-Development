const fs = require('fs');
const path = require('path');

function getReceiptsDir() {
  // backend/.. -> Appdev
  return path.resolve(__dirname, '..', '..', 'Receipts');
}

function getReceiptPath(orderId) {
  const safeId = String(orderId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeId) {
    throw new Error('Invalid order id');
  }
  return path.join(getReceiptsDir(), `order-${safeId}.json`);
}

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function writeReceipt(orderId, receipt) {
  const dir = getReceiptsDir();
  await ensureDir(dir);

  const target = getReceiptPath(orderId);
  const tmp = `${target}.tmp`;
  const payload = JSON.stringify(receipt, null, 2);

  await fs.promises.writeFile(tmp, payload, 'utf8');
  await fs.promises.rename(tmp, target);
  return target;
}

async function readReceipt(orderId) {
  const filePath = getReceiptPath(orderId);
  const raw = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function receiptExists(orderId) {
  try {
    await fs.promises.access(getReceiptPath(orderId), fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  getReceiptsDir,
  getReceiptPath,
  writeReceipt,
  readReceipt,
  receiptExists,
};
