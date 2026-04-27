import { Router } from "express";
import {
  createProfileHandler,
  deleteProfileHandler,
  getProfileHandler,
} from "../controllers/profiles.controller";
import {
  getProfilesV2Handler,
  searchProfilesHandler,
} from "../controllers/profilesV2.controller";

const router = Router();

router.get("/search", searchProfilesHandler);
router.get("/", getProfilesV2Handler);
router.post("/", createProfileHandler);
router.get("/:id", getProfileHandler);
router.delete("/:id", deleteProfileHandler);

export default router;
