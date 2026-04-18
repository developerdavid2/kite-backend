import { v4 as uuidv4 } from "uuid";
import { connectDatabase } from "../config/database";
import { ProfileModel } from "../models/profile.model";
import { fetchGenderPrediction } from "./genderize.service";
import { AgifyApiError, fetchAgePrediction } from "./agify.service";
import {
  NationalizeApiError,
  fetchNationalityPrediction,
} from "./nationalize.service";
import { GenderizeApiError } from "./genderize.service";
import { getAgeGroup, getTopCountry } from "../utils/classification.util";
import {
  ProfileData,
  ProfileFilterParams,
  ProfileListItem,
} from "../types/profiles.types";

function formatProfile(profile: any): ProfileData {
  return {
    id: profile.id,
    name: profile.name,
    gender: profile.gender,
    gender_probability: profile.gender_probability,
    sample_size: profile.sample_size,
    age: profile.age,
    age_group: profile.age_group,
    country_id: profile.country_id,
    country_probability: profile.country_probability,
    created_at:
      profile.created_at instanceof Date
        ? profile.created_at.toISOString()
        : profile.created_at,
  };
}

export async function createProfile(
  name: string
): Promise<{ profile: ProfileData; isExisting: boolean }> {
  await connectDatabase();

  const normalizedName = name.toLowerCase().trim();

  const existing = await ProfileModel.findOne({ name: normalizedName });
  if (existing) {
    return { profile: formatProfile(existing), isExisting: true };
  }

  const [genderData, ageData, nationalityData] = await Promise.all([
    fetchGenderPrediction(normalizedName),
    fetchAgePrediction(normalizedName),
    fetchNationalityPrediction(normalizedName),
  ]);

  if (genderData.gender === null || genderData.count === 0) {
    throw new GenderizeApiError("Genderize returned an invalid response");
  }

  if (ageData.age === null) {
    throw new AgifyApiError("Agify returned an invalid response");
  }

  if (!nationalityData.country || nationalityData.country.length === 0) {
    throw new NationalizeApiError("Nationalize returned an invalid response");
  }

  const topCountry = getTopCountry(nationalityData.country);

  const profile = await ProfileModel.create({
    id: uuidv4(),
    name: normalizedName,
    gender: genderData.gender,
    gender_probability: genderData.probability,
    sample_size: genderData.count,
    age: ageData.age,
    age_group: getAgeGroup(ageData.age),
    country_id: topCountry.country_id,
    country_probability: topCountry.probability,
    created_at: new Date(),
  });

  return { profile: formatProfile(profile), isExisting: false };
}

export async function getProfileById(id: string): Promise<ProfileData | null> {
  await connectDatabase();
  const profile = await ProfileModel.findOne({ id });
  if (!profile) return null;
  return formatProfile(profile);
}

export async function getAllProfiles(
  filters: ProfileFilterParams
): Promise<ProfileListItem[]> {
  await connectDatabase();

  const query: Record<string, unknown> = {};

  if (filters.gender) {
    query.gender = filters.gender.toLowerCase();
  }
  if (filters.country_id) {
    query.country_id = filters.country_id.toUpperCase();
  }
  if (filters.age_group) {
    query.age_group = filters.age_group.toLowerCase();
  }

  const profiles = await ProfileModel.find(query).sort({ created_at: -1 });

  return profiles.map((p) => ({
    id: p.id,
    name: p.name,
    gender: p.gender,
    age: p.age,
    age_group: p.age_group,
    country_id: p.country_id,
  }));
}

export async function deleteProfileById(id: string): Promise<boolean> {
  await connectDatabase();
  const result = await ProfileModel.deleteOne({ id });
  return result.deletedCount === 1;
}
