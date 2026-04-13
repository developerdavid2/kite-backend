import { RequestHandler } from "express";
import { fetchGenderPrediction } from "../services/genderize.service";
import { successResponse, errorResponse } from "../utils/response.util";
import { ClassifyResult } from "../types/genderize.types";

export const classifyName: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const name = req.query.name;

    if (name === undefined || name === null) {
      res.status(400).json(errorResponse("Missing or empty name parameter"));
      return;
    }

    if (Array.isArray(name) || typeof name !== "string") {
      res.status(422).json(errorResponse("name is not a string"));
      return;
    }

    if (name.trim() === "") {
      res.status(400).json(errorResponse("Missing or empty name parameter"));
      return;
    }

    const prediction = await fetchGenderPrediction(name.trim());

    if (prediction.gender === null || prediction.count === 0) {
      res
        .status(404)
        .json(errorResponse("No prediction available for the provided name"));
      return;
    }

    const is_confident =
      prediction.probability >= 0.7 && prediction.count >= 100;

    const result: ClassifyResult = {
      name: prediction.name,
      gender: prediction.gender,
      probability: prediction.probability,
      sample_size: prediction.count,
      is_confident,
      processed_at: new Date().toISOString(),
    };

    res.status(200).json(successResponse<ClassifyResult>(result));
  } catch (error) {
    next(error);
  }
};
