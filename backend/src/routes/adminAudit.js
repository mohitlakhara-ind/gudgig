import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// GET /api/admin/audit?entity=Job&entityId=<id>&page=1&limit=20
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { entity, entityId } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (entity) filter.entity = entity;
    if (entityId) filter.entityId = entityId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter)
    ]);

    res.json({ success: true, data: logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

export default router;


