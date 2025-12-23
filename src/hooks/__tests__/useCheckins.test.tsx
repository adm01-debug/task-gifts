import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@/test/test-utils';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCheckins } from '../useCheckins';

// Mock the checkinsService
vi.mock('@/services/checkinsService', () => ({
  checkinsService: {
    getTemplates: vi.fn().mockResolvedValue([
      { id: '1', name: 'Weekly Template', questions: [] }
    ]),
    getMyCheckins: vi.fn().mockResolvedValue([
      { id: '1', status: 'completed', scheduled_at: '2024-01-01' }
    ]),
    getUpcomingCheckins: vi.fn().mockResolvedValue([
      { id: '2', status: 'pending', scheduled_at: '2024-01-15' }
    ]),
    createCheckin: vi.fn().mockResolvedValue({ id: '3' }),
    completeCheckin: vi.fn().mockResolvedValue({ id: '1' }),
    addActionItem: vi.fn().mockResolvedValue({}),
    toggleActionItem: vi.fn().mockResolvedValue({}),
  },
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useCheckins Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns templates, checkins, and upcomingCheckins', async () => {
    const { result } = renderHook(() => useCheckins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.templates).toHaveLength(1);
    expect(result.current.checkins).toHaveLength(1);
    expect(result.current.upcomingCheckins).toHaveLength(1);
  });

  it('provides mutation functions', async () => {
    const { result } = renderHook(() => useCheckins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.createCheckin).toBe('function');
    expect(typeof result.current.completeCheckin).toBe('function');
    expect(typeof result.current.addActionItem).toBe('function');
    expect(typeof result.current.toggleActionItem).toBe('function');
  });
});
