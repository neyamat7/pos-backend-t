import Supplier from "./supplier.model.js";

// @desc create new suppliers
// @access Admin
export const createSupplier = async (data) => {
  // Get all suppliers and find the highest sl value numerically
  const allSuppliers = await Supplier
    .find()
    .select("basic_info.sl")
    .lean();

  // Calculate the next sl value by finding the max numeric value
  let nextSl = 1;
  
  if (allSuppliers && allSuppliers.length > 0) {
    // Convert all sl values to numbers and find the maximum
    const slNumbers = allSuppliers
      .map(supplier => {
        if (supplier.basic_info && supplier.basic_info.sl) {
          const num = parseInt(supplier.basic_info.sl, 10);
          return isNaN(num) ? 0 : num;
        }
        return 0;
      })
      .filter(num => num > 0);

    if (slNumbers.length > 0) {
      const maxSl = Math.max(...slNumbers);
      nextSl = maxSl + 1;
    }
  }

  // Format the sl as a zero-padded string (e.g., "01", "02", "10", "100")
  const formattedSl = nextSl.toString().padStart(2, "0");

  // Set the auto-generated sl in the data
  if (!data.basic_info) {
    data.basic_info = {};
  }
  data.basic_info.sl = formattedSl;

  const supplier = new Supplier(data);
  return await supplier.save();
};

// @desc Get  all supplier
// @access Admin
export const getAllSuppliers = async (page, limit, search = '') => {
  const skip = (page - 1) * limit;

  // Build search filter - only active suppliers
  const searchFilter = { isActive: true };
  if (search) {
    searchFilter['basic_info.name'] = { $regex: search, $options: 'i' };
  }

  const total = await Supplier.countDocuments(searchFilter);
  const suppliers = await Supplier.find(searchFilter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    suppliers,
  };
};

// @desc Get  single supplier information
// @access Admin
export const getSupplierById = async (id) => {
  return await Supplier.findById(id);
};

// @desc update suppliers information
// @access Admin
export const updateSupplier = async (id, data) => {
  return await Supplier.findByIdAndUpdate(id, data, { new: true });
};

// @desc Get  suppliers  by name, email, phone, location
// @access Admin
export const searchSuppliers = async (query) => {
  const { name, email, phone, location } = query;

  // Build dynamic filter - only active suppliers
  const filter = { isActive: true };

  if (name) {
    filter["basic_info.name"] = { $regex: name, $options: "i" };
  }

  if (email) {
    filter["contact_info.email"] = { $regex: email, $options: "i" };
  }

  if (phone) {
    filter["contact_info.phone"] = { $regex: phone, $options: "i" };
  }

  if (location) {
    filter["contact_info.location"] = { $regex: location, $options: "i" };
  }

  // Find matching suppliers
  const suppliers = await Supplier.find(filter);
  return suppliers;
};

// @desc Get suppliers with due amount and support search by name, email, phone
// @access Admin
export const getDueSuppliersService = async (searchQuery = "", page, limit) => {
  const skip = (page - 1) * limit;

  const searchFilter = {};

  if (searchQuery) {
    const regex = new RegExp(searchQuery, "i"); // case-insensitive search
    searchFilter.$or = [
      { "basic_info.name": regex },
      { "contact_info.phone": regex },
      { "contact_info.email": regex },
    ];
  }

  const filter = {
    ...searchFilter,
    isActive: true, // Only active suppliers
    "account_info.due": { $gt: 0 },
  };

  const suppliers = await Supplier.find(filter)
    .select(
      "basic_info.name  basic_info.role contact_info.phone contact_info.email account_info.due"
    )
    .skip(skip)
    .limit(limit);

  const total = suppliers.length;

  return {
    suppliers,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    total,
  };
};

/**
 * Formula: Supplier Due = Total Sold Amount - Lot Profit - Total Expenses
 */
export const updateSupplierDueForStockOut = async ({
  supplierId,
  totalSoldAmount,
  lotProfit,
  totalExpenses,
  session = null
}) => {
  // Calculate supplier due amount
  const supplierDueAmount = totalSoldAmount - lotProfit - totalExpenses;

  // Get supplier
  const query = Supplier.findById(supplierId);
  if (session) {
    query.session(session);
  }
  const supplier = await query;

  if (!supplier) {
    throw new Error(`Supplier not found: ${supplierId}`);
  }

  // Update supplier due
  const currentDue = Number(supplier.account_info?.due) || 0;
  const updateQuery = Supplier.findByIdAndUpdate(
    supplierId,
    { $set: { "account_info.due": currentDue + supplierDueAmount } },
    { new: true }
  );

  if (session) {
    updateQuery.session(session);
  }

  const updatedSupplier = await updateQuery;

  return {
    supplier: updatedSupplier,
    supplierDueAmount,
    calculation: {
      totalSoldAmount,
      lotProfit,
      totalExpenses,
      supplierDue: supplierDueAmount
    }
  };
};

/**
 * This adjusts the supplier's due by the difference between old and new amounts
 */
export const adjustSupplierDue = async ({
  supplierId,
  previousDueAdded,
  newDueAmount,
  session = null
}) => {
  // Calculate the adjustment (difference between new and old)
  const adjustment = newDueAmount - previousDueAdded;

  // Get supplier
  const query = Supplier.findById(supplierId);
  if (session) {
    query.session(session);
  }
  const supplier = await query;

  if (!supplier) {
    throw new Error(`Supplier not found: ${supplierId}`);
  }

  // Adjust supplier due by the difference
  const currentDue = Number(supplier.account_info?.due) || 0;
  const newSupplierDue = currentDue + adjustment;

  const updateQuery = Supplier.findByIdAndUpdate(
    supplierId,
    { $set: { "account_info.due": newSupplierDue } },
    { new: true }
  );

  if (session) {
    updateQuery.session(session);
  }

  const updatedSupplier = await updateQuery;

  return {
    supplier: updatedSupplier,
    adjustment,
    previousDueAdded,
    newDueAmount,
    newSupplierDue
  };
};

// @desc    Soft delete supplier (Archive)
// @access  Admin
export const softDeleteSupplier = async (id, userId) => {
  // Check if supplier exists
  const supplier = await Supplier.findById(id);

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  // Check if supplier is already archived
  if (!supplier.isActive) {
    throw new Error("Supplier is already archived");
  }

  // Check if supplier has outstanding dues
  if (supplier.account_info.due > 0) {
    throw new Error("Cannot archive supplier with outstanding dues");
  }

  // Perform soft delete
  return await Supplier.findByIdAndUpdate(
    id,
    {
      isActive: false,
      deletedAt: new Date(),
      deletedBy: userId,
    },
    { new: true }
  );
};

// @desc    Restore archived supplier
// @access  Admin
export const restoreSupplier = async (id) => {
  const supplier = await Supplier.findById(id);

  if (!supplier) {
    throw new Error("Supplier not found");
  }

  if (supplier.isActive) {
    throw new Error("Supplier is not archived");
  }

  return await Supplier.findByIdAndUpdate(
    id,
    {
      isActive: true,
      deletedAt: null,
      deletedBy: null,
    },
    { new: true }
  );
};

// @desc    Get archived suppliers with pagination
// @access  Admin
export const getArchivedSuppliers = async (page, limit, search) => {
  const skip = (page - 1) * limit;

  const query = { isActive: false }; // Only archived suppliers
  if (search) {
    const regex = new RegExp(search, "i");
    query["basic_info.name"] = regex;
  }

  const total = await Supplier.countDocuments(query);
  const suppliers = await Supplier
    .find(query)
    .skip(skip)
    .limit(limit)
    .sort({ deletedAt: -1 })
    .populate("deletedBy", "name email");

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    suppliers,
  };
};
