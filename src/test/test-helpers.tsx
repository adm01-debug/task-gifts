/**
 * Test Utilities - Helpers para testes
 */

import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ReactElement, ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllProvidersProps {
  children: ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Mock helpers
export function mockSupabaseUser(userId = "test-user-id") {
  return {
    id: userId,
    email: "test@example.com",
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { full_name: "Test User" },
    aud: "authenticated",
  };
}

export function mockSupabaseSession(userId = "test-user-id") {
  return {
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    expires_at: Date.now() / 1000 + 3600,
    expires_in: 3600,
    token_type: "bearer",
    user: mockSupabaseUser(userId),
  };
}

// Wait helpers
export function waitForLoadingToFinish() {
  return new Promise(resolve => setTimeout(resolve, 0));
}

export async function waitFor(
  callback: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 50 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await callback()) return;
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`waitFor timed out after ${timeout}ms`);
}

// Accessibility helpers
export function getByTestId(container: HTMLElement, testId: string) {
  return container.querySelector(`[data-testid="${testId}"]`);
}

export function getAllByTestId(container: HTMLElement, testId: string) {
  return container.querySelectorAll(`[data-testid="${testId}"]`);
}
