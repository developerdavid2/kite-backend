import axios from "axios";
import { AgifyApiResponse } from "../types/profiles.types";

const AGIFY_API_URL = "https://api.agify.io";

export class AgifyApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AgifyApiError";
  }
}

export async function fetchAgePrediction(
  name: string
): Promise<AgifyApiResponse> {
  try {
    const response = await axios.get<AgifyApiResponse>(AGIFY_API_URL, {
      params: { name },
    });
    return response.data;
  } catch {
    throw new AgifyApiError("Agify returned an invalid response");
  }
}
