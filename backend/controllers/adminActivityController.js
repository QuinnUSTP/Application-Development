/**
 * Admin Activity Controller
 * Browse recent audit trail events.
 */

const AdminActivityLog = require('../models/AdminActivityLog');

// GET /api/admin/activity (admin only)
// Query params:
// - limit (default 50, max 200)
// - page (default 1)
// - q (search actor username, action, target name/id)
// - action
// - targetType
// - status
exports.listActivity = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 200);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);

    const q = String(req.query.q || '').trim();
    const action = String(req.query.action || '').trim();
    const targetType = String(req.query.targetType || '').trim();
    const status = String(req.query.status || '').trim();

    const filter = {};

    if (action) filter.action = action;
    if (targetType) filter['target.type'] = targetType;
    if (status) filter.status = status;

    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { 'actor.username': rx },
        { action: rx },
        { 'target.name': rx },
        { 'target.id': rx },
        { message: rx },
      ];
    }

    const [items, total] = await Promise.all([
      AdminActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit),
      AdminActivityLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: items.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
