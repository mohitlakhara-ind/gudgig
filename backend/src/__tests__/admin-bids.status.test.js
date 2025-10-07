import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/server.js';
import jwt from 'jsonwebtoken';

let mongo;

function sign(user) {
  return jwt.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'test_secret');
}

describe('Admin Bids Status API', () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    process.env.JWT_SECRET = 'test_secret';
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongo) await mongo.stop();
  });

  test('PATCH /api/admin/bids/:id/status accepts and rejects bids', async () => {
    const User = (await import('../../src/models/User.js')).default;
    const Job = (await import('../../src/models/Job.js')).default;
    const Bid = (await import('../../src/models/Bid.js')).default;

    const admin = await User.create({ name: 'Admin', email: 'admin@test.com', role: 'admin', password: 'x' });
    const employer = await User.create({ name: 'Emp', email: 'emp@test.com', role: 'admin', password: 'x' });
    const freelancer = await User.create({ name: 'Free', email: 'free@test.com', role: 'freelancer', password: 'x' });

    const job = await Job.create({ title: 'Test', category: 'SEO', description: 'd', requirements: [], createdBy: employer._id });
    const bid = await Bid.create({ jobId: job._id, userId: freelancer._id, quotation: '1000', proposal: 'p', bidFeePaid: 1, paymentStatus: 'succeeded' });

    const token = sign(admin);

    const acceptRes = await request(app)
      .patch(`/api/admin/bids/${bid._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'accepted' });
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body?.success).toBe(true);

    const updatedBid = await Bid.findById(bid._id);
    expect(updatedBid.selectionStatus).toBe('accepted');

    const updatedJob = await Job.findById(job._id);
    expect(String(updatedJob.selectedFreelancerId)).toBe(String(freelancer._id));

    const rejectRes = await request(app)
      .patch(`/api/admin/bids/${bid._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'rejected' });
    expect(rejectRes.status).toBe(200);
    const rejectedBid = await Bid.findById(bid._id);
    expect(rejectedBid.selectionStatus).toBe('rejected');
  });
});


