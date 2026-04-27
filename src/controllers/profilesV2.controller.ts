import { RequestHandler } from "express";
import { parseNaturalLanguageQuery } from "../utils/queryParser.util";
import { getFilteredProfiles } from "../services/profilesV2.service";
import { errorResponse } from "../utils/response.util";
import { ProfileFilterParams } from "../types/profileV2.types";
const VALID_SORT_FIELDS = ["age", "created_at", "gender_probability"];
const VALID_ORDERS = ["asc", "desc"];

function parseNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

export const getProfilesV2Handler: RequestHandler = async (
  req,
  res,
  next,
): Promise<void> => {
  try {
    const {
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      min_gender_probability,
      min_country_probability,
      sort_by,
      order,
      page,
      limit,
    } = req.query;

    if (
      sort_by !== undefined &&
      !VALID_SORT_FIELDS.includes(sort_by as string)
    ) {
      res.status(400).json(errorResponse("Invalid query parameters"));
      return;
    }

    if (order !== undefined && !VALID_ORDERS.includes(order as string)) {
      res.status(400).json(errorResponse("Invalid query parameters"));
      return;
    }

    const filters: ProfileFilterParams = {
      gender: gender as string | undefined,
      age_group: age_group as string | undefined,
      country_id: country_id as string | undefined,
      min_age: parseNumber(min_age),
      max_age: parseNumber(max_age),
      min_gender_probability: parseNumber(min_gender_probability),
      min_country_probability: parseNumber(min_country_probability),
      sort_by: sort_by as ProfileFilterParams["sort_by"],
      order: order as ProfileFilterParams["order"],
      page: parseNumber(page),
      limit: parseNumber(limit),
    };

    const {
      profiles,
      total,
      page: pg,
      limit: lm,
    } = await getFilteredProfiles(filters);

    res.status(200).json({
      status: "success",
      page: pg,
      limit: lm,
      total,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};

export const searchProfilesHandler: RequestHandler = async (
  req,
  res,
  next,
): Promise<void> => {
  try {
    const { q, page, limit } = req.query;

    if (!q || typeof q !== "string" || q.trim() === "") {
      res.status(400).json(errorResponse("Missing or empty query parameter"));
      return;
    }

    const parsed = parseNaturalLanguageQuery(q as string);

    if (!parsed) {
      res.status(422).json(errorResponse("Unable to interpret query"));
      return;
    }

    const filters: ProfileFilterParams = {
      ...parsed,
      page: parseNumber(page),
      limit: parseNumber(limit),
    };

    const {
      profiles,
      total,
      page: pg,
      limit: lm,
    } = await getFilteredProfiles(filters);

    res.status(200).json({
      status: "success",
      page: pg,
      limit: lm,
      total,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};
