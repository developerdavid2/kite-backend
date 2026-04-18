import { ErrorRequestHandler } from "express";
import { errorResponse } from "../utils/response.util";
import { GenderizeApiError } from "../services/genderize.service";
import { AgifyApiError } from "../services/agify.service";
import { NationalizeApiError } from "../services/nationalize.service";

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
): void => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] Error:`, err);

  if (
    err instanceof GenderizeApiError ||
    err instanceof AgifyApiError ||
    err instanceof NationalizeApiError
  ) {
    res.status(502).json(errorResponse(err.message));
    return;
  }

  res.status(500).json(errorResponse("Internal server error"));
};
