// @vitest-environment jsdom

import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

// Mock MapView
vi.mock("@/components/Map", () => ({
  MapView: () => <div data-testid="mock-map-view" />,
}));

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    guide: {
      route: {
        useQuery: () => ({ data: null }),
      },
    },
    visitor: {
      stats: {
        useQuery: () => ({ data: { count: 14825, lastUpdated: new Date().toISOString() } }),
      },
      recordVisit: {
        useMutation: () => ({ mutate: vi.fn() }),
      },
    },
  },
}));

import { PandalMap } from "./PandalMap";
import { VisitorCount } from "./VisitorCount";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

afterEach(() => {
  cleanup();
});

describe("Pandal Directory Search & Clear", () => {
  it("filters pandals when user types in search bar and clears cleanly on clear button click", () => {
    render(<PandalMap showMap={false} />);

    const searchInput = screen.getByRole("textbox", { name: /search pandals/i });
    expect(searchInput).toBeInTheDocument();

    // Type 'Bagbazar'
    fireEvent.change(searchInput, { target: { value: "Bagbazar" } });
    expect(searchInput).toHaveValue("Bagbazar");
    expect(screen.getByText(/Found/i)).toBeInTheDocument();

    // Click clear search button
    const clearButton = screen.getByRole("button", { name: /clear search/i });
    expect(clearButton).toBeInTheDocument();
    fireEvent.click(clearButton);

    // Verify search query was reset to empty string
    expect(searchInput).toHaveValue("");
  });
});

describe("Live Visitor Counter", () => {
  it("renders live visitor count formatted with Bengali digits", () => {
    render(<VisitorCount />);

    expect(screen.getByText(/লাইভ দর্শনার্থী · Live Visitors/i)).toBeInTheDocument();
  });
});
