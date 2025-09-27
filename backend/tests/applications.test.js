import request from 'supertest';
import app from '../src/server.js';
import { registerAndLogin, createCompanyForEmployer, createJobForEmployer } from './utils/helpers.js';

describe('Application Endpoints', () => {
  let jobseekerToken, employerToken, employerId, companyId, jobId;

  beforeAll(async () => {
    // Create an employer and a job
    const employer = await registerAndLogin('employer');
    employerToken = employer.token;
    employerId = employer.userId;
    const company = await createCompanyForEmployer(employerId);
    companyId = company._id;
    const job = await createJobForEmployer(employerId, companyId);
    jobId = job._id;

    // Create a jobseeker
    const jobseeker = await registerAndLogin('jobseeker');
    jobseekerToken = jobseeker.token;
  });

  it('should return 401 for unauthenticated user', async () => {
    const res = await request(app).get('/api/applications');
    expect(res.statusCode).toEqual(401);
  });

  it('should allow a jobseeker to apply for a job', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${jobseekerToken}`)
      .send({
        job: jobId,
        coverLetter: 'I am very interested in this position and believe my skills are a great fit for your company. I look forward to hearing from you.',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'pending');
  });
});