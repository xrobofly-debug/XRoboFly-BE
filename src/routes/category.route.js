import express from "express";
import {
    getAllCategories,
    getAllCategoriesAdmin,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
} from "../controller/category.controller.js";
import { adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategory);

// Admin routes
router.get("/admin/all", adminRoute, getAllCategoriesAdmin);
router.post("/", adminRoute, createCategory);
router.put("/:id", adminRoute, updateCategory);
router.delete("/:id", adminRoute, deleteCategory);

// Subcategory routes
router.post("/:id/subcategory", adminRoute, addSubcategory);
router.put("/:categoryId/subcategory/:subcategoryId", adminRoute, updateSubcategory);
router.delete("/:categoryId/subcategory/:subcategoryId", adminRoute, deleteSubcategory);

export default router;
