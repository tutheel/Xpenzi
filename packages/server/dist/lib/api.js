import { ZodError } from "zod";
export function jsonError(res, message, status = 400) {
    return res.status(status).json({ message });
}
export function handleApiError(res, error) {
    if (error instanceof ZodError) {
        const message = error.errors[0]?.message ?? "Invalid request";
        return jsonError(res, message, 400);
    }
    if (error instanceof Error) {
        if (error.message === "UNAUTHORIZED") {
            return jsonError(res, "Unauthorized", 401);
        }
        if (error.message === "CLERK_USER_MISSING_EMAIL") {
            return jsonError(res, "User email is missing", 400);
        }
        return jsonError(res, error.message || "Server error", 500);
    }
    return jsonError(res, "Server error", 500);
}
