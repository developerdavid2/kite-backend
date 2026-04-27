import { prisma } from "../config/postgres";
import { ProfileFilterParams, ProfileV2 } from "../types/profileV2.types";

function formatProfile(profile: any): ProfileV2 {
  return {
    id: profile.id,
    name: profile.name,
    gender: profile.gender,
    gender_probability: profile.gender_probability,
    age: profile.age,
    age_group: profile.age_group,
    country_id: profile.country_id,
    country_name: profile.country_name,
    country_probability: profile.country_probability,
    created_at:
      profile.created_at instanceof Date
        ? profile.created_at.toISOString()
        : profile.created_at,
  };
}

function buildWhereClause(filters: ProfileFilterParams) {
  const where: any = {};

  if (filters.gender) {
    where.gender = filters.gender.toLowerCase();
  }

  if (filters.age_group) {
    where.age_group = filters.age_group.toLowerCase();
  }

  if (filters.country_id) {
    where.country_id = filters.country_id.toUpperCase();
  }

  if (filters.min_age !== undefined || filters.max_age !== undefined) {
    where.age = {};
    if (filters.min_age !== undefined) where.age.gte = filters.min_age;
    if (filters.max_age !== undefined) where.age.lte = filters.max_age;
  }

  if (filters.min_gender_probability !== undefined) {
    where.gender_probability = { gte: filters.min_gender_probability };
  }

  if (filters.min_country_probability !== undefined) {
    where.country_probability = { gte: filters.min_country_probability };
  }

  return where;
}

export async function getFilteredProfiles(
  filters: ProfileFilterParams,
): Promise<{
  profiles: ProfileV2[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 10));
  const skip = (page - 1) * limit;

  const sortField = filters.sort_by ?? "created_at";
  const sortOrder = filters.order ?? "asc";

  const where = buildWhereClause(filters);

  const [profiles, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.profile.count({ where }),
  ]);

  return {
    profiles: profiles.map(formatProfile),
    total,
    page,
    limit,
  };
}
