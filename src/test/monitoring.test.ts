import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/loggingService", () => {
  const handler = { current: null as ((entry: unknown) => void) | null };
  return {
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      setExternalHandler: vi.fn((fn: (entry: unknown) => void) => { handler.current = fn; }),
      _handler: handler,
    },
  };
});

import { initMonitoring } from "@/lib/monitoring";
import { logger } from "@/services/loggingService";

describe("monitoring", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls setExternalHandler on init", () => {
    initMonitoring();
    expect(logger.setExternalHandler).toHaveBeenCalled();
  });

  it("registers unhandledrejection listener", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    initMonitoring();
    expect(addSpy).toHaveBeenCalledWith("unhandledrejection", expect.any(Function));
    addSpy.mockRestore();
  });
});
