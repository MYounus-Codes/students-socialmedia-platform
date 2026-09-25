import { NextResponse } from "next/server";
import { createUsername } from "@/lib/auth/username";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { createServerClient } from "@/lib/supabase/server";
import { checkRateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { rateLimitResponse } from "@/lib/rate-limit/response";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const limit = await checkRateLimit(`auth:signup:${getRequestIdentifier(request)}`, { windowSeconds: 3600, maxRequests: 5 });
    if (!limit.allowed) return rateLimitResponse(limit);
    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid signup data",
          },
        },
        { status: 400 },
      );
    }

    const supabase = createPublicServerClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName,
        },
      },
    });

    if (authError || !authData.user) {
      const message = authError?.message ?? "Unable to create your account.";
      const isDuplicate = message.toLowerCase().includes("already") || message.toLowerCase().includes("registered");

      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: isDuplicate ? "EMAIL_ALREADY_REGISTERED" : "AUTH_SIGNUP_FAILED",
            message: isDuplicate ? "An account with this email already exists." : message,
          },
        },
        { status: isDuplicate ? 409 : 400 },
      );
    }

    if (authData.user.identities?.length === 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "EMAIL_ALREADY_REGISTERED",
            message: "An account with this email already exists.",
          },
        },
        { status: 409 },
      );
    }

    const admin = createAdminClient();
    const username = createUsername(parsed.data.fullName, authData.user.id);

    const { error: profileError } = await admin
      .from("profiles")
      .update({ full_name: parsed.data.fullName, username })
      .eq("id", authData.user.id);

    if (profileError) {
      if (profileError.code === "23505") {
        const fallbackUsername = `student-${authData.user.id.replaceAll("-", "").slice(0, 12)}`;
        const { error: fallbackError } = await admin
          .from("profiles")
          .update({ full_name: parsed.data.fullName, username: fallbackUsername })
          .eq("id", authData.user.id);
        if (fallbackError) {
          await admin.auth.admin.deleteUser(authData.user.id);
          return NextResponse.json(
            {
              success: false,
              data: null,
              error: {
                code: "PROFILE_CREATION_FAILED",
                message: "Your account could not be finished. Please try again.",
              },
            },
            { status: 500 },
          );
        }
      } else {
        await admin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: {
              code: "PROFILE_CREATION_FAILED",
              message: "Your account could not be finished. Please try again.",
            },
          },
          { status: 500 },
        );
      }
    }

    if (authData.session) {
      const sessionClient = await createServerClient();
      const { error: sessionError } = await sessionClient.auth.setSession(authData.session);
      if (sessionError) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: { code: "SESSION_CREATION_FAILED", message: "Account created, but the session could not be started. Please log in." },
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: authData.user.id,
        username,
        requiresEmailConfirmation: !authData.session,
        session: authData.session,
      },
      error: null,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "SERVER_ERROR", message: "Unable to process signup request." },
      },
      { status: 500 },
    );
  }
}
