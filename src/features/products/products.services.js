import Product from "./products.model.js";

// Get all products (populate category)
export const getAllProducts = async (page, limit, search) => {
  const skip = (page - 1) * limit;

  const query = { isDeleted: { $ne: true } };
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { productName: { $regex: escapedSearch, $options: "i" } },
      { productNameBn: { $regex: escapedSearch, $options: "i" } },
    ];
  }

  const total = await Product.countDocuments(query);

  const products = await Product.find(query)
    .populate("categoryId", "categoryName")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    products,
  };
};

// Get single product by id (populate category)
export const getProductById = async (id) => {
  return await Product.findById(id).populate("categoryId", "categoryName");
};

export const createProduct = async (data) => {
  const product = new Product(data);
  return await product.save();
};

export const updateProduct = async (id, data) => {
  return await Product.findByIdAndUpdate(id, data, { new: true }).populate(
    "categoryId",
    "categoryName"
  );
};

export const deleteProductService = async (id) => {
  return await Product.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
};
