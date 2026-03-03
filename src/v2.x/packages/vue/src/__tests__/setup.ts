import { vi } from "vitest";

// Suppress console during tests when needed
vi.stubGlobal("console", {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
});

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
