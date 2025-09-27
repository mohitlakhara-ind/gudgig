import request from 'supertest';
import app from '../src/server.js';
import { registerAndLogin, createCompanyForEmployer } from './utils/helpers.js';
import Job from '../src/models/Job.js';

describe('Job Endpoints', () => {
  let employerToken, employerId, companyId;

  beforeAll(async () => {
    const { token, userId } = await registerAndLogin('employer');
    employerToken = token;
    employerId = userId;
    const company = await createCompanyForEmployer(employerId);
    companyId = company._id;
  });

  it('should fetch all jobs', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should not allow a jobseeker to create a job', async () => {
    const { token } = await registerAndLogin('jobseeker');
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toEqual(403);
  });

  it('should allow an employer to create a job', async () => {
    const res = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${employerToken}`)
      .send({
        title: 'Software Engineer',
        description: 'A very detailed description of the software engineer role that is definitely more than fifty characters long.',
        category: 'Technology',
        type: 'full-time',
        location: 'Remote',
        experience: '3-5 years',
        company: companyId,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('title', 'Software Engineer');
  });
});