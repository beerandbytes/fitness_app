import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('should return stored value from localStorage', () => {
    localStorageMock.setItem('test-key', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(result.current[0]).toBe('new-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify('new-value')
    );
  });

  it('should handle object values', () => {
    const objValue = { name: 'test', count: 5 };
    const { result } = renderHook(() => useLocalStorage('test-key', objValue));

    act(() => {
      result.current[1]({ name: 'updated', count: 10 });
    });

    expect(result.current[0]).toEqual({ name: 'updated', count: 10 });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'test-key',
      JSON.stringify({ name: 'updated', count: 10 })
    );
  });

  it('should handle array values', () => {
    const arrayValue = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage('test-key', arrayValue));

    act(() => {
      result.current[1]([4, 5, 6]);
    });

    expect(result.current[0]).toEqual([4, 5, 6]);
  });

  it('should handle null values', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', null));

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBeNull();
  });
});

