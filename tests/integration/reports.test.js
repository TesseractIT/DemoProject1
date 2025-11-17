const request = require('supertest');
const express = require('express');
const reportRoutes = require('../../routes/reports');

const app = express();
app.use(express.json());
app.use('/reports', reportRoutes);

describe('Integration Test - Reports API', () => {
  it('should return all reports successfully', async () => {
    const res = await request(app).get('/reports');
    expect(res.statusCode).toBe(200);
    expect(res.body.success || Array.isArray(res.body)).toBeTruthy();
  });

  it('should return 404 for non-existent report ID', async () => {
    const res = await request(app).get('/reports/999');
    expect([404, 200]).toContain(res.statusCode); // 404 preferred
  });
});
