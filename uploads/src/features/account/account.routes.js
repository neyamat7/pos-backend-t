import express from "express";
import {
  createAccount,
  getAllAccounts,
  updateAccount,
} from "./account.controller.js";
import { authMiddleware } from "../../middleware/auth.js";

const router = express.Router();

// get all
router.get("/all", getAllAccounts);

// add a account
router.post("/add", authMiddleware, createAccount);

// details view
router.put("/update/:id", authMiddleware, updateAccount);

export default router;
