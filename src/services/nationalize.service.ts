import axios from "axios";
import { NationalizeApiResponse } from "../types/profiles.types";

const NATIONALIZE_API_URL = "https://api.nationalize.io";

export class NationalizeApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NationalizeApiError";
  }
}

export async function fetchNationalityPrediction(
  name: string
): Promise<NationalizeApiResponse> {
  try {
    const response = await axios.get<NationalizeApiResponse>(
      NATIONALIZE_API_URL,
      { params: { name } }
    );
    return response.data;
  } catch {
    throw new NationalizeApiError("Nationalize returned an invalid response");
  }
}
