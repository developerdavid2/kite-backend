import { Router } from "express";
import {
  createProfileHandler,
  deleteProfileHandler,
  getAllProfilesHandler,
  getProfileHandler,
} from "../controllers/profiles.controller";

const router = Router();

router.post("/", createProfileHandler);
router.get("/", getAllProfilesHandler);
router.get("/:id", getProfileHandler);
router.delete("/:id", deleteProfileHandler);

export default router;
