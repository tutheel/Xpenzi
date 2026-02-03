import type { Response } from "express";
export declare function jsonError(res: Response, message: string, status?: number): Response<any, Record<string, any>>;
export declare function handleApiError(res: Response, error: unknown): Response<any, Record<string, any>>;
