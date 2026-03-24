/**
 * AdminActivityLog Model
 * Lightweight audit trail for admin/ops actions.
 */

const mongoose = require('mongoose');

const AdminActivityLogSchema = new mongoose.Schema(
  {
    actor: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      username: { type: String, required: true },
      role: { type: String, required: true },
    },

    action: {
      type: String,
      required: true,
      trim: true,
      // keep flexible; we can tighten later
    },

    target: {
      type: {
        type: String,
        required: true,
        trim: true,
      },
      id: { type: String, default: null },
      name: { type: String, default: null },
    },

    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },

    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },

    meta: {
      type: Object,
      default: undefined,
    },

    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true }
);

AdminActivityLogSchema.index({ createdAt: -1 });
AdminActivityLogSchema.index({ action: 1, createdAt: -1 });
AdminActivityLogSchema.index({ 'actor.id': 1, createdAt: -1 });
AdminActivityLogSchema.index({ 'target.type': 1, createdAt: -1 });
AdminActivityLogSchema.index({ 'target.id': 1, createdAt: -1 });

module.exports = mongoose.model('AdminActivityLog', AdminActivityLogSchema);
