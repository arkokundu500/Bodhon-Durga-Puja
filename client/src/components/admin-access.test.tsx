// @vitest-environment jsdom

import React from "react";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({ user: null as { role?: string; name?: string; email?: string } | null }));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: authState.user, loading: false }),
}));

import DashboardLayout from "./DashboardLayout";
import { SiteHeader } from "./SiteHeader";

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
  authState.user = null;
});

describe("owner-only media access", () => {
  it("shows the sign-in gate to anonymous visitors", () => {
    render(<DashboardLayout><p>Upload controls</p></DashboardLayout>);

    expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
    expect(screen.queryByText("Upload controls")).not.toBeInTheDocument();
  });

  it("denies signed-in regular users", () => {
    authState.user = { role: "user", name: "Visitor" };
    render(<DashboardLayout><p>Upload controls</p></DashboardLayout>);

    expect(screen.getByText("This studio is private.")).toBeInTheDocument();
    expect(screen.queryByText("Upload controls")).not.toBeInTheDocument();
  });

  it("renders the dashboard children for admins", () => {
    authState.user = { role: "admin", name: "Owner", email: "owner@example.com" };
    render(<DashboardLayout><p>Upload controls</p></DashboardLayout>);

    expect(screen.getByText("Upload controls")).toBeInTheDocument();
    expect(screen.getByText("Media Manager")).toBeInTheDocument();
  });
});

describe("owner Studio entry point", () => {
  it("is hidden from anonymous visitors", () => {
    render(<SiteHeader />);

    expect(screen.queryByRole("link", { name: /Studio/ })).not.toBeInTheDocument();
  });

  it("is visible to admins and points to the media manager", () => {
    authState.user = { role: "admin" };
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: /Studio/ })).toHaveAttribute("href", "/media-manager");
  });
});
