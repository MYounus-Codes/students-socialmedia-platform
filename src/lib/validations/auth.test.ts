import { describe, expect, it } from "vitest";
import { loginSchema, signUpSchema } from "@/lib/validations/auth";

describe("auth validation", () => {
  it("accepts valid signup input", () => {
    const parsed = signUpSchema.safeParse({
      fullName: "Ava Martins",
      email: "ava@campus.edu",
      password: "strongpassword",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects duplicate invalid email", () => {
    const parsed = loginSchema.safeParse({
      email: "not-an-email",
      password: "12345678",
    });

    expect(parsed.success).toBe(false);
  });
});
