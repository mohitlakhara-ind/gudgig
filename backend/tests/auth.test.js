import request from 'supertest';
import app from '../src/server.js';

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: `test.${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'jobseeker',
  };

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
  });

  it('should not allow registration with an existing email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should log in an existing user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
  });
});