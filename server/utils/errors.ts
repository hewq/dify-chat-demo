import type { Response } from "express";

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  detail?: unknown,
) {
  return res.status(statusCode).json({
    error: message,
    detail,
  });
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}
