/**
 * adminAudit
 * Helper to write admin activity logs consistently.
 */

const AdminActivityLog = require('../models/AdminActivityLog');

function getReqIp(req) {
  // If behind a proxy, Express would need trust proxy; keep simple.
  return (
    req?.headers?.['x-forwarded-for']?.toString().split(',')[0].trim() ||
    req?.ip ||
    req?.connection?.remoteAddress ||
    null
  );
}

async function writeAdminAudit(req, {
  action,
  targetType,
  targetId = null,
  targetName = null,
  status = 'success',
  message = '',
  meta = undefined,
} = {}) {
  if (!req?.user) return null;
  if (!action || !targetType) return null;

  try {
    const doc = await AdminActivityLog.create({
      actor: {
        id: req.user._id || req.user.id,
        username: req.user.username,
        role: req.user.role,
      },
      action,
      target: {
        type: targetType,
        id: targetId ? String(targetId) : null,
        name: targetName ? String(targetName) : null,
      },
      status,
      message,
      meta,
      ip: getReqIp(req),
      userAgent: req?.headers?.['user-agent'] || null,
    });

    return doc;
  } catch (e) {
    // never block the request on audit failures
    return null;
  }
}

module.exports = {
  writeAdminAudit,
};
