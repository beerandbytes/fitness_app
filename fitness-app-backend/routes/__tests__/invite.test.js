const request = require('supertest');
const express = require('express');
const inviteRouter = require('../invite');

const app = express();
app.use(express.json());
app.use('/api/invite', inviteRouter);

describe('Invite Routes', () => {
  describe('GET /api/invite/:token', () => {
    it('should validate invite token', async () => {
      const token = 'test-token';
      const response = await request(app)
        .get(`/api/invite/${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('valid');
    });
  });
});

