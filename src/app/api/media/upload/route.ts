import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { rateLimitResponse } from "@/lib/rate-limit/response";

const mediaUploadSchema = z.object({
  mimeType: z.string(),
  size: z.number().max(10 * 1024 * 1024, "File must be smaller than 10MB"),
  filename: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const limit = await checkRateLimit(`media:upload:${getRequestIdentifier(request)}`, { windowSeconds: 60, maxRequests: 20 });
    if (!limit.allowed) return rateLimitResponse(limit);
    const body = await request.json();
    const parsed = mediaUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid upload payload",
          },
        },
        { status: 400 },
      );
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "application/pdf",
    ];

    if (!allowedMimeTypes.includes(parsed.data.mimeType)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "UNSUPPORTED_MEDIA", message: "Unsupported file type." },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Upload metadata validated." },
      error: null,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "SERVER_ERROR", message: "Unable to validate the media upload." },
      },
      { status: 500 },
    );
  }
}
