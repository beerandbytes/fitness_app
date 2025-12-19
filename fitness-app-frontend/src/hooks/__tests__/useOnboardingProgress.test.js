import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useOnboardingProgress from '../useOnboardingProgress';

// Mock localStorage
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

describe('useOnboardingProgress', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('debe inicializar con paso 0 si no hay progreso guardado', () => {
    const { result } = renderHook(() => useOnboardingProgress());

    expect(result.current.currentStep).toBe(0);
    expect(result.current.isCompleted).toBe(false);
  });

  it('debe cargar el progreso desde localStorage', () => {
    localStorageMock.setItem('onboarding_progress', '2');

    const { result } = renderHook(() => useOnboardingProgress());

    expect(result.current.currentStep).toBe(2);
  });

  it('debe avanzar al siguiente paso', () => {
    const { result } = renderHook(() => useOnboardingProgress());

    act(() => {
      result.current.nextStep();
    });

    expect(result.current.currentStep).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('onboarding_progress', '1');
  });

  it('debe retroceder al paso anterior', () => {
    localStorageMock.setItem('onboarding_progress', '2');
    const { result } = renderHook(() => useOnboardingProgress());

    act(() => {
      result.current.prevStep();
    });

    expect(result.current.currentStep).toBe(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('onboarding_progress', '1');
  });

  it('debe establecer un paso específico', () => {
    const { result } = renderHook(() => useOnboardingProgress());

    act(() => {
      result.current.setStep(3);
    });

    expect(result.current.currentStep).toBe(3);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('onboarding_progress', '3');
  });

  it('debe marcar como completado', () => {
    const { result } = renderHook(() => useOnboardingProgress());

    act(() => {
      result.current.complete();
    });

    expect(result.current.isCompleted).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('onboarding_completed', 'true');
  });

  it('debe resetear el progreso', () => {
    localStorageMock.setItem('onboarding_progress', '3');
    localStorageMock.setItem('onboarding_completed', 'true');

    const { result } = renderHook(() => useOnboardingProgress());

    act(() => {
      result.current.reset();
    });

    expect(result.current.currentStep).toBe(0);
    expect(result.current.isCompleted).toBe(false);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('onboarding_progress');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('onboarding_completed');
  });
});








