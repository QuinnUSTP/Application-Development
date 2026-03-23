/**
 * Minimal logger helper.
 *
 * - In production, only errors are printed.
 * - In development/test, info/warn logs are allowed.
 */

function isProduction() {
  return String(process.env.NODE_ENV || '').toLowerCase() === 'production';
}

function info(...args) {
  if (!isProduction()) console.log(...args);
}

function warn(...args) {
  if (!isProduction()) console.warn(...args);
}

function error(...args) {
  console.error(...args);
}

module.exports = {
  info,
  warn,
  error,
};
