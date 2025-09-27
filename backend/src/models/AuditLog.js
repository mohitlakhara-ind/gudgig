import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    entity: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: { type: String, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    details: { type: Object },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model('AuditLog', AuditLogSchema);


