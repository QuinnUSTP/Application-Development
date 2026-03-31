#!/usr/bin/env node
/**
 * Lightweight DB watcher for local development.
 * Prints collection counts and recent order/user/product snapshots in near real time.
 *
 * Usage:
 *   npm run db:watch
 *
 * Optional env:
 *   DB_WATCH_INTERVAL_MS=2000
 */

require('dotenv').config();
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const AdminActivityLog = require('../models/AdminActivityLog');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/redstore';
const intervalMs = Math.max(500, Number(process.env.DB_WATCH_INTERVAL_MS || 2000));

let timer = null;

function formatDate(dt) {
  if (!dt) return '—';
  const d = new Date(dt);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

async function readSnapshot() {
  const [
    products,
    categories,
    users,
    admins,
    orders,
    pendingOrders,
    carts,
    adminLogs,
    newestOrder,
    newestUser,
    lowStockCount,
  ] = await Promise.all([
    Product.countDocuments({}),
    Category.countDocuments({}),
    User.countDocuments({}),
    User.countDocuments({ role: 'admin' }),
    Order.countDocuments({}),
    Order.countDocuments({ status: 'pending' }),
    Cart.countDocuments({}),
    AdminActivityLog.countDocuments({}),
    Order.findOne({}).sort({ createdAt: -1 }).select('_id status totalAmount createdAt').lean(),
    User.findOne({}).sort({ createdAt: -1 }).select('_id username email createdAt').lean(),
    Product.countDocuments({ stock: { $lte: 5 } }),
  ]);

  return {
    products,
    categories,
    users,
    admins,
    orders,
    pendingOrders,
    carts,
    adminLogs,
    newestOrder,
    newestUser,
    lowStockCount,
    ts: new Date(),
  };
}

function render(snapshot) {
  process.stdout.write('\x1Bc'); // clear screen
  console.log('📊 RedStore DB Watch (near real-time)');
  console.log(`MongoDB: ${uri}`);
  console.log(`Updated: ${snapshot.ts.toLocaleString()} | Interval: ${intervalMs}ms`);
  console.log('='.repeat(72));

  console.log(`products: ${snapshot.products} (low stock <=5: ${snapshot.lowStockCount})`);
  console.log(`categories: ${snapshot.categories}`);
  console.log(`users: ${snapshot.users} (admins: ${snapshot.admins})`);
  console.log(`orders: ${snapshot.orders} (pending: ${snapshot.pendingOrders})`);
  console.log(`carts: ${snapshot.carts}`);
  console.log(`adminactivitylogs: ${snapshot.adminLogs}`);
  console.log('-'.repeat(72));

  if (snapshot.newestOrder) {
    console.log(
      `latest order: #${String(snapshot.newestOrder._id).slice(0, 8)} | status=${snapshot.newestOrder.status} | total=${snapshot.newestOrder.totalAmount} | ${formatDate(snapshot.newestOrder.createdAt)}`
    );
  } else {
    console.log('latest order: —');
  }

  if (snapshot.newestUser) {
    console.log(
      `latest user: ${snapshot.newestUser.username || '(no username)'} <${snapshot.newestUser.email || '—'}> | ${formatDate(snapshot.newestUser.createdAt)}`
    );
  } else {
    console.log('latest user: —');
  }

  console.log('='.repeat(72));
  console.log('Press Ctrl+C to stop');
}

async function tick() {
  try {
    const snapshot = await readSnapshot();
    render(snapshot);
  } catch (err) {
    console.error('❌ Failed to read DB snapshot:', err.message);
  }
}

async function start() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB. Starting watcher...');
    await tick();
    timer = setInterval(tick, intervalMs);
  } catch (err) {
    console.error('❌ Could not start DB watcher:', err.message);
    process.exit(1);
  }
}

function shutdown() {
  if (timer) clearInterval(timer);
  mongoose.connection.close(false).finally(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
