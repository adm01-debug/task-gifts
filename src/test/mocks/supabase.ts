/**
 * Shared Supabase mock for unit testing.
 * Provides a chainable mock that simulates Supabase query builder.
 */
import { vi } from "vitest";

// Chainable mock builder
function createChainMock(resolvedData: unknown = null, error: unknown = null) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};

  const methods = [
    "select", "insert", "update", "delete", "upsert",
    "eq", "neq", "in", "is", "not",
    "gt", "gte", "lt", "lte",
    "like", "ilike", "or", "and",
    "order", "limit", "range",
    "single", "maybeSingle",
    "returns",
  ];

  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }

  // Terminal methods return the data
  chain.single = vi.fn().mockResolvedValue({ data: resolvedData, error });
  chain.maybeSingle = vi.fn().mockResolvedValue({ data: resolvedData, error });
  chain.then = vi.fn((cb) => cb({ data: resolvedData, error }));

  // Make select return the chain but also resolve
  const originalSelect = chain.select;
  chain.select = vi.fn((...args: unknown[]) => {
    originalSelect(...args);
    return Object.assign(Promise.resolve({ data: resolvedData ? [resolvedData] : [], error }), chain);
  });

  return chain;
}

export function createMockSupabase() {
  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: "test-user-id", email: "test@example.com" } },
      error: null,
    }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: { user: { id: "test-user-id" } } },
      error: null,
    }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  };

  const mockRpc = vi.fn().mockResolvedValue({ data: null, error: null });

  const mockFrom = vi.fn().mockReturnValue(createChainMock());

  const mockFunctions = {
    invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
  };

  const mockChannel = vi.fn().mockReturnValue({
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  });

  return {
    auth: mockAuth,
    from: mockFrom,
    rpc: mockRpc,
    functions: mockFunctions,
    channel: mockChannel,
    removeChannel: vi.fn(),
    // Helper to set mock data for a specific table
    __setMockData(data: unknown, error: unknown = null) {
      mockFrom.mockReturnValue(createChainMock(data, error));
    },
    __setRpcResult(data: unknown, error: unknown = null) {
      mockRpc.mockResolvedValue({ data, error });
    },
  };
}

// Default mock instance
export const mockSupabase = createMockSupabase();
