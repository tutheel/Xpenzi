import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const message = error.errors[0]?.message ?? "Invalid request";
    return jsonError(message, 400);
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return jsonError("Unauthorized", 401);
    }
    if (error.message === "CLERK_USER_MISSING_EMAIL") {
      return jsonError("User email is missing", 400);
    }
    return jsonError(error.message || "Server error", 500);
  }

  return jsonError("Server error", 500);
}