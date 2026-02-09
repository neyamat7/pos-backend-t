import { logActivity } from "../../utils/activityLogger.js";
import * as productService from "./products.services.js";

// Get all products
export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const products = await productService.getAllProducts(
      parseInt(page),
      parseInt(limit),
      search
    );

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const newProduct = await productService.createProduct(req.body);

    // Log activity
    await logActivity({
      model_name: "Product",
      logs_fields_id: newProduct._id,
      by: userId,
      action: "Created",
      note: `created new product ${newProduct.productName}  by ${userEmail}`,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an existing product
export const updateProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    const updatedProduct = await productService.updateProduct(
      req.params.id,
      req.body
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Log activity
    await logActivity({
      model_name: "Product",
      logs_fields_id: updatedProduct._id,
      by: userId,
      action: "Updated",
      note: `updated  product  ${updatedProduct.productName} by ${userEmail}`,
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
