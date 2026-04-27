import { ParsedQuery } from "../types/profileV2.types";
import { resolveCountryId } from "./countryMapper.util";

const GENDER_MALE = ["male", "males", "man", "men", "boy", "boys"];
const GENDER_FEMALE = ["female", "females", "woman", "women", "girl", "girls"];

const AGE_GROUP_KEYWORDS: Record<string, string> = {
  child: "child",
  children: "child",
  kid: "child",
  kids: "child",
  teenager: "teenager",
  teenagers: "teenager",
  teen: "teenager",
  teens: "teenager",
  adolescent: "teenager",
  adult: "adult",
  adults: "adult",
  senior: "senior",
  seniors: "senior",
  elderly: "senior",
  elder: "senior",
  old: "senior",
};

export function parseNaturalLanguageQuery(query: string): ParsedQuery | null {
  const q = query.toLowerCase().trim();

  if (!q) return null;

  const result: ParsedQuery = {};
  let matched = false;

  for (const word of GENDER_FEMALE) {
    if (q.includes(word)) {
      result.gender = "female";
      matched = true;
      break;
    }
  }

  if (!result.gender) {
    for (const word of GENDER_MALE) {
      if (q.includes(word)) {
        result.gender = "male";
        matched = true;
        break;
      }
    }
  }

  for (const [keyword, group] of Object.entries(AGE_GROUP_KEYWORDS)) {
    if (q.includes(keyword)) {
      result.age_group = group;
      matched = true;
      break;
    }
  }

  if (q.includes("young") && !result.age_group) {
    result.min_age = 16;
    result.max_age = 24;
    matched = true;
  }

  const aboveMatch = q.match(/(?:above|over|older than|at least)\s+(\d+)/);
  if (aboveMatch) {
    result.min_age = parseInt(aboveMatch[1], 10);
    matched = true;
  }

  const belowMatch = q.match(/(?:below|under|younger than|at most)\s+(\d+)/);
  if (belowMatch) {
    result.max_age = parseInt(belowMatch[1], 10);
    matched = true;
  }

  const betweenMatch = q.match(/between\s+(\d+)\s+and\s+(\d+)/);
  if (betweenMatch) {
    result.min_age = parseInt(betweenMatch[1], 10);
    result.max_age = parseInt(betweenMatch[2], 10);
    matched = true;
  }

  const fromMatch = q.match(/(?:from|in)\s+([a-z\s]+?)(?:\s|$)/);
  if (fromMatch) {
    const countryRaw = fromMatch[1].trim();
    const countryId = resolveCountryId(countryRaw);
    if (countryId) {
      result.country_id = countryId;
      matched = true;
    }
  }

  if (!matched) return null;

  return result;
}
