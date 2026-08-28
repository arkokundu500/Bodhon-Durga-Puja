import { describe, expect, it } from "vitest";
import { isAdminUser } from "./admin-access";

describe("isAdminUser", () => {
  it("allows the admin role", () => {
    expect(isAdminUser({ role: "admin" })).toBe(true);
  });

  it("rejects regular, anonymous, and malformed users", () => {
    expect(isAdminUser({ role: "user" })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
    expect(isAdminUser({ role: "owner" })).toBe(false);
  });
});
