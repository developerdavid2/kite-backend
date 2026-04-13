import axios from "axios";
import { GenderizeApiResponse } from "../types/genderize.types";

const GENDERIZE_API_URL = "https://api.genderize.io";

export class GenderizeApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenderizeApiError";
  }
}

export async function fetchGenderPrediction(
  name: string
): Promise<GenderizeApiResponse> {
  try {
    const response = await axios.get<GenderizeApiResponse>(GENDERIZE_API_URL, {
      params: { name },
    });
    return response.data;
  } catch (error) {
    throw new GenderizeApiError(
      "Failed to fetch gender prediction from Genderize API"
    );
  }
}
