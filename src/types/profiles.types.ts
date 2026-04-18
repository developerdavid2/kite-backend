export interface ProfileData {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  sample_size: number;
  age: number;
  age_group: string;
  country_id: string;
  country_probability: number;
  created_at: string;
}

export interface ProfileListItem {
  id: string;
  name: string;
  gender: string;
  age: number;
  age_group: string;
  country_id: string;
}

export interface ProfileFilterParams {
  gender?: string;
  country_id?: string;
  age_group?: string;
}

export interface AgifyApiResponse {
  name: string;
  age: number | null;
  count: number;
}

export interface NationalizeCountry {
  country_id: string;
  probability: number;
}

export interface NationalizeApiResponse {
  name: string;
  country: NationalizeCountry[];
}
