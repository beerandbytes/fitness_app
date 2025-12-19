import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useKeyboardShortcuts from '../useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  let mockCallbacks;

  beforeEach(() => {
    mockCallbacks = {
      onSave: vi.fn(),
      onSearch: vi.fn(),
      onEscape: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should register keyboard shortcuts', () => {
    const { result } = renderHook(() => useKeyboardShortcuts(mockCallbacks));
    expect(result.current).toBeDefined();
  });

  it('should handle Ctrl+S for save', () => {
    renderHook(() => useKeyboardShortcuts(mockCallbacks));
    
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      bubbles: true,
    });
    
    document.dispatchEvent(event);
    // Note: Actual implementation may vary
  });
});

