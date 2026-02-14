import express from "express";
import { authMiddleware } from "../../middleware/auth.js";
import {
    createSupplier,
    getAllSuppliers,
    getArchivedSuppliers,
    getDueSuppliersController,
    getSupplierById,
    getSuppliersByQuery,
    restoreSupplier,
    softDeleteSupplier,
    updateSupplier,
} from "./supplier.controller.js";

const router = express.Router();

router.get("/", getSuppliersByQuery);

// add suppliers
router.post("/add", authMiddleware, createSupplier);

// add get all
router.get("/all", getAllSuppliers);

// get details view
router.get("/details/:id", getSupplierById);

// update
router.put("/update/:id", authMiddleware, updateSupplier);

// GET due-list
router.get("/due-list", getDueSuppliersController);

// Soft delete (archive)
router.delete("/delete/:id", authMiddleware, softDeleteSupplier);

// Restore from archive
router.patch("/restore/:id", authMiddleware, restoreSupplier);

// Get archived list
router.get("/archived", authMiddleware, getArchivedSuppliers);

export default router;
