export interface GenderizeApiResponse {
  name: string;
  gender: string | null;
  probability: number;
  count: number;
}

export interface ClassifyResult {
  name: string;
  gender: string;
  probability: number;
  sample_size: number;
  is_confident: boolean;
  processed_at: string;
}

export interface ApiSuccessResponse<T> {
  status: "success";
  data: T;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
}
