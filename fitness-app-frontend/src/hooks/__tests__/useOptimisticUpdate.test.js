import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useOptimisticUpdate from '../useOptimisticUpdate';
import useToastStore from '../../stores/useToastStore';

vi.mock('../../stores/useToastStore');

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};

describe('useOptimisticUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.mockReturnValue(mockToast);
  });

  it('should execute optimistic update successfully', async () => {
    const { result } = renderHook(() => useOptimisticUpdate({
      successMessage: 'Success',
      errorMessage: 'Error',
    }));

    const optimisticUpdate = vi.fn();
    const apiCall = vi.fn().mockResolvedValue({ data: 'result' });

    await act(async () => {
      await result.current.execute(optimisticUpdate, apiCall);
    });

    expect(optimisticUpdate).toHaveBeenCalled();
    expect(apiCall).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith('Success');
  });

  it('should handle errors and show error message', async () => {
    const { result } = renderHook(() => useOptimisticUpdate({
      successMessage: 'Success',
      errorMessage: 'Error',
    }));

    const optimisticUpdate = vi.fn();
    const apiCall = vi.fn().mockRejectedValue(new Error('API Error'));

    await act(async () => {
      try {
        await result.current.execute(optimisticUpdate, apiCall);
      } catch (e) {
        // Expected to throw
      }
    });

    expect(mockToast.error).toHaveBeenCalledWith('Error');
  });
});

