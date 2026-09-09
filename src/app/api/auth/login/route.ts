import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { checkRateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { rateLimitResponse } from "@/lib/rate-limit/response";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const limit = await checkRateLimit(`auth:login:${getRequestIdentifier(request)}`, { windowSeconds: 60, maxRequests: 10 });
    if (!limit.allowed) return rateLimitResponse(limit);
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid login data",
          },
        },
        { status: 400 },
      );
    }

    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: error?.message.toLowerCase().includes("confirm") ? "EMAIL_NOT_CONFIRMED" : "AUTH_LOGIN_FAILED",
            message: error?.message ?? "Unable to sign in.",
          },
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { session: data.session },
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "SERVER_ERROR", message: "Unable to process login request." },
      },
      { status: 500 },
    );
  }
}
