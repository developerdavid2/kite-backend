export interface ProfileV2 {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  age: number;
  age_group: string;
  country_id: string;
  country_name: string;
  country_probability: number;
  created_at: string;
}

export interface ProfileFilterParams {
  gender?: string;
  age_group?: string;
  country_id?: string;
  min_age?: number;
  max_age?: number;
  min_gender_probability?: number;
  min_country_probability?: number;
  sort_by?: "age" | "created_at" | "gender_probability";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedProfilesResponse {
  status: "success";
  page: number;
  limit: number;
  total: number;
  data: ProfileV2[];
}

export interface ParsedQuery {
  gender?: string;
  age_group?: string;
  country_id?: string;
  min_age?: number;
  max_age?: number;
}
