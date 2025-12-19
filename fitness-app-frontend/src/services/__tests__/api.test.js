import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import api from '../api';

vi.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should make GET request', async () => {
    const mockData = { data: { id: 1, name: 'Test' } };
    axios.get.mockResolvedValue(mockData);

    const response = await api.get('/test');
    expect(axios.get).toHaveBeenCalledWith('/test', undefined);
    expect(response.data).toEqual(mockData.data);
  });

  it('should make POST request', async () => {
    const mockData = { data: { success: true } };
    const postData = { name: 'Test' };
    axios.post.mockResolvedValue(mockData);

    const response = await api.post('/test', postData);
    expect(axios.post).toHaveBeenCalledWith('/test', postData, undefined);
    expect(response.data).toEqual(mockData.data);
  });

  it('should include auth token in headers when available', async () => {
    localStorage.setItem('userToken', 'test-token');
    axios.get.mockResolvedValue({ data: {} });

    await api.get('/test');
    expect(axios.get).toHaveBeenCalledWith(
      '/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('should handle errors', async () => {
    const error = {
      response: {
        status: 404,
        data: { error: 'Not found' },
      },
    };
    axios.get.mockRejectedValue(error);

    await expect(api.get('/test')).rejects.toEqual(error);
  });
});

