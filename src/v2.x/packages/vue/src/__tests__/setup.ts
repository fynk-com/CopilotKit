import { vi } from "vitest";

// Suppress console during tests when needed
vi.stubGlobal("console", {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
});
