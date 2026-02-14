import customerModel from "./customer.model.js";

// @desc    Create a new customer
// @access  Admin
export const createCustomer = async (data) => {
  // Get all customers and find the highest sl value numerically
  const allCustomers = await customerModel
    .find()
    .select("basic_info.sl")
    .lean();

  // Calculate the next sl value by finding the max numeric value
  let nextSl = 1;
  
  if (allCustomers && allCustomers.length > 0) {
    // Convert all sl values to numbers and find the maximum
    const slNumbers = allCustomers
      .map(customer => {
        if (customer.basic_info && customer.basic_info.sl) {
          const num = parseInt(customer.basic_info.sl, 10);
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

  const customer = new customerModel(data);
  return await customer.save();
};

// @desc    Update a customer by ID
// @access  Admin
export const updateCustomer = async (id, data) => {
  return await customerModel.findByIdAndUpdate(id, data, { new: true });
};

// @desc    Get all customers with pagination
// @access  Admin
export const getAllCustomers = async (page, limit, search) => {
  const skip = (page - 1) * limit;

  const query = { isActive: true }; // Only show active customers
  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { "basic_info.name": regex },
      { "contact_info.phone": regex },
    ];
  }

  const total = await customerModel.countDocuments(query);
  const customers = await customerModel
    .find(query)
    .skip(skip)
    .limit(limit)
    .limit(limit)
    .sort({ isPinned: -1, createdAt: -1 });

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    customers,
  };
};

// @desc   Get single customer by ID
// @access  Admin
export const getCustomerById = async (id) => {
  return await customerModel.findById(id);
};

// @desc Get  customers  by name, email, phone, location
// @access Admin
export const searchCustomers = async (query) => {
  const { name, email, phone, location } = query;

  // Build dynamic filter - only active customers
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

  // Find matching customers
  const customers = await customerModel.find(filter);
  return customers;
};

// @desc   Get customers due list with optional search by name, email, phone
// @access Admin
export const getDueCustomersService = async (searchQuery = "", page, limit) => {
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
    isActive: true, // Only active customers
    "account_info.due": { $gt: 0 },
  };

  const customers = await customerModel
    .find(filter)
    .select(
      "basic_info.name  basic_info.role contact_info.phone contact_info.email account_info.due"
    )
    .skip(skip)
    .limit(limit);

  const total = await customerModel.countDocuments(filter);

  return {
    customers,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    total,
  };
};

// @desc    Soft delete customer (Archive)
// @access  Admin
export const softDeleteCustomer = async (id, userId) => {
  // Check if customer exists
  const customer = await customerModel.findById(id);

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Check if customer is already archived
  if (!customer.isActive) {
    throw new Error("Customer is already archived");
  }

  // Check if customer has outstanding dues
  if (customer.account_info.due > 0) {
    throw new Error("Cannot archive customer with outstanding dues");
  }

  // Perform soft delete
  return await customerModel.findByIdAndUpdate(
    id,
    {
      isActive: false,
      deletedAt: new Date(),
      deletedBy: userId,
    },
    { new: true }
  );
};

// @desc    Restore archived customer
// @access  Admin
export const restoreCustomer = async (id) => {
  const customer = await customerModel.findById(id);

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (customer.isActive) {
    throw new Error("Customer is not archived");
  }

  return await customerModel.findByIdAndUpdate(
    id,
    {
      isActive: true,
      deletedAt: null,
      deletedBy: null,
    },
    { new: true }
  );
};

// @desc    Get archived customers with pagination
// @access  Admin
export const getArchivedCustomers = async (page, limit, search) => {
  const skip = (page - 1) * limit;

  const query = { isActive: false }; // Only archived customers
  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { "basic_info.name": regex },
      { "contact_info.phone": regex },
    ];
  }

  const total = await customerModel.countDocuments(query);
  const customers = await customerModel
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
    customers,
  };
};

// @desc    Toggle customer pin status
// @access  Admin
export const toggleCustomerPin = async (id) => {
  const customer = await customerModel.findById(id);

  if (!customer) {
    throw new Error("Customer not found");
  }

  return await customerModel.findByIdAndUpdate(
    id,
    { isPinned: !customer.isPinned },
    { new: true }
  );
};
