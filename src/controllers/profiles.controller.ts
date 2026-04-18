import { RequestHandler } from "express";
import {
  createProfile,
  deleteProfileById,
  getAllProfiles,
  getProfileById,
} from "../services/profiles.service";
import { errorResponse, successResponse } from "../utils/response.util";
import { ProfileFilterParams } from "../types/profiles.types";
import { GenderizeApiError } from "../services/genderize.service";
import { AgifyApiError } from "../services/agify.service";
import { NationalizeApiError } from "../services/nationalize.service";

export const createProfileHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const name = req.body?.name;

    if (name === undefined || name === null) {
      res.status(400).json(errorResponse("Missing or empty name parameter"));
      return;
    }

    if (typeof name !== "string") {
      res.status(422).json(errorResponse("name must be a string"));
      return;
    }

    if (name.trim() === "") {
      res.status(400).json(errorResponse("Missing or empty name parameter"));
      return;
    }

    const { profile, isExisting } = await createProfile(name);

    if (isExisting) {
      res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: profile,
      });
      return;
    }

    res.status(201).json(successResponse(profile));
  } catch (error) {
    if (
      error instanceof GenderizeApiError ||
      error instanceof AgifyApiError ||
      error instanceof NationalizeApiError
    ) {
      res.status(502).json(errorResponse((error as Error).message));
      return;
    }
    next(error);
  }
};
export const getProfileHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { id } = req.params;
    const profile = await getProfileById(id as string);

    if (!profile) {
      res.status(404).json(errorResponse("Profile not found"));
      return;
    }

    res.status(200).json(successResponse(profile));
  } catch (error) {
    next(error);
  }
};

export const getAllProfilesHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const filters: ProfileFilterParams = {
      gender: req.query.gender as string | undefined,
      country_id: req.query.country_id as string | undefined,
      age_group: req.query.age_group as string | undefined,
    };

    const profiles = await getAllProfiles(filters);

    res.status(200).json({
      status: "success",
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfileHandler: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteProfileById(id as string);

    if (!deleted) {
      res.status(404).json(errorResponse("Profile not found"));
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
