import express from "express";
import { authMiddleware } from "../../middleware/auth.js";
import {
  createCustomer,
  getAllCustomers,
  getArchivedCustomers,
  getCustomerById,
  getCustomersByQuery,
  getDueCustomersController,
  restoreCustomer,
  softDeleteCustomer,
  toggleCustomerPin,
  updateCustomer,
} from "./customer.controller.js";

const router = express.Router();

router.get("/", getCustomersByQuery);

// add new customer
router.post("/add", authMiddleware, createCustomer);

// update customer
router.put("/update/:id", authMiddleware, updateCustomer);

// get all customer
router.get("/all", getAllCustomers);

// get details view
router.get("/details/:id", getCustomerById);

// GET due-list
router.get("/due-list", getDueCustomersController);

// Soft delete (archive)
router.delete("/delete/:id", authMiddleware, softDeleteCustomer);

// Restore from archive
router.patch("/restore/:id", authMiddleware, restoreCustomer);

// Toggle pin status
router.patch("/pin/:id", authMiddleware, toggleCustomerPin);

// Get archived list
router.get("/archived", authMiddleware, getArchivedCustomers);

export default router;
