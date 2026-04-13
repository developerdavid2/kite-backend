import { ErrorRequestHandler } from "express";
import { errorResponse } from "../utils/response.util";
import { GenderizeApiError } from "../services/genderize.service";

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
): void => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Error:`, err);

  if (err instanceof GenderizeApiError) {
    res.status(502).json(errorResponse(err.message));
    return;
  }

  res.status(500).json(errorResponse("Internal server error"));
};
