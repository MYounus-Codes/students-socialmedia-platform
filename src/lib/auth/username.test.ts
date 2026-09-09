import { describe, expect, it } from "vitest";
import { createUsername } from "./username";

describe("username generation", () => {
  it("creates a readable unique handle from the name and user id", () => {
    expect(createUsername("Ava Martins", "12345678-1234-1234-1234-123456789abc")).toBe("ava-martins-123456");
  });

  it("falls back to student for names without URL-safe characters", () => {
    expect(createUsername("---", "abcdef12-0000-0000-0000-000000000000")).toBe("student-abcdef");
  });
});
