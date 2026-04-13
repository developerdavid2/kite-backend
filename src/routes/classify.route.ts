import { Router } from "express";
import { classifyName } from "../controllers/classify.controller";

const router = Router();

router.get("/", classifyName);

export default router;
