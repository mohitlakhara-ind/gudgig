import request from 'supertest';
import app from '../server.js';

describe('Subscription middleware and routes', () => {
	it('GET /api/subscriptions/me requires auth', async () => {
		const res = await request(app).get('/api/subscriptions/me');
		expect([401, 403]).toContain(res.status);
	});
});


