import request from 'supertest';
import app from '../src/server.js';

describe('Server Tests', () => {
  // Test health endpoint
  describe('GET /health', () => {
    it('should return server health status', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);

      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('environment');
    });
  });

  // Test 404 handler
  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });
  });

  // Test API base route
  describe('GET /api', () => {
    it('should return 404 for API base route', async () => {
      const res = await request(app)
        .get('/api')
        .expect(404);

      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });
  });
});
