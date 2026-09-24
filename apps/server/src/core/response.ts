// ============================================================================
// Standardised API response helpers
// All responses MUST go through these helpers — never raw res.json()
// ============================================================================

import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  options?: {
    message?: string;
    statusCode?: number;
    meta?: PaginationMeta;
  },
): Response {
  const statusCode = options?.statusCode ?? 200;
  const message = options?.message;
  const meta = options?.meta;
  const body: ApiSuccessResponse<T> = { success: true, data };
  if (message !== undefined) body.message = message;
  if (meta !== undefined) body.meta = meta;
  return res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  const opts: { statusCode: number; message?: string } = { statusCode: 201 };
  if (message !== undefined) opts.message = message;
  return sendSuccess(res, data, opts);
}

export function sendNoContent(res: Response): Response {
  return res.status(204).send();
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  const errorBody: ApiErrorResponse['error'] = { code, message };
  if (details !== undefined) errorBody.details = details;
  const body: ApiErrorResponse = { success: false, error: errorBody };
  return res.status(statusCode).json(body);
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
