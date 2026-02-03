import type { Request, Response, NextFunction } from "express";
export declare function ensureUserFromClerkId(clerkUserId: string): Promise<{
    id: string;
    clerkUserId: string;
    email: string;
    name: string;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                clerkUserId: string;
                email: string;
                name: string;
                imageUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        }
    }
}
