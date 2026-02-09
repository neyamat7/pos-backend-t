import express from "express";
import { filterUsersByRole, getAll, getById } from "./user.controller.js";

const router = express.Router();

router.get("/", getAll);

router.get("/:id", getById);

router.get("/role/:role", filterUsersByRole);

export default router;
