import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Still initial

    vi.advanceTimersByTime(500);
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should cancel previous debounce on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 500 },
      }
    );

    rerender({ value: 'second', delay: 500 });
    vi.advanceTimersByTime(250);
    rerender({ value: 'third', delay: 500 });
    vi.advanceTimersByTime(250);
    
    expect(result.current).toBe('first'); // Still first

    vi.advanceTimersByTime(500);
    await waitFor(() => {
      expect(result.current).toBe('third'); // Should be third, not second
    });
  });

  it('should use custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    rerender({ value: 'updated', delay: 1000 });
    vi.advanceTimersByTime(500);
    expect(result.current).toBe('initial');

    vi.advanceTimersByTime(500);
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });
});

