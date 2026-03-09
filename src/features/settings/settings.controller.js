import {
  getCratePricesService,
  updateCratePricesService,
} from "./settings.services.js";

// @desc    Get global crate prices
// @route   GET /api/v1/settings/crate-prices
// @access  Private
export const getCratePricesController = async (req, res, next) => {
  try {
    const settings = await getCratePricesService();
    res.status(200).json({
      success: true,
      message: "Crate prices fetched successfully.",
      data: {
        global_crate_type_1_price: settings.global_crate_type_1_price,
        global_crate_type_2_price: settings.global_crate_type_2_price,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update global crate prices
// @route   PUT /api/v1/settings/crate-prices
// @access  Private
export const updateCratePricesController = async (req, res, next) => {
  try {
    const { global_crate_type_1_price, global_crate_type_2_price } = req.body;

    // Convert to numbers if they are strings, keep undefined if not provided
    const updateData = {};
    if (global_crate_type_1_price !== undefined) {
      updateData.global_crate_type_1_price =
        Number(global_crate_type_1_price) || 0;
    }
    if (global_crate_type_2_price !== undefined) {
      updateData.global_crate_type_2_price =
        Number(global_crate_type_2_price) || 0;
    }

    const settings = await updateCratePricesService(updateData);
    res.status(200).json({
      success: true,
      message: "Crate prices updated successfully.",
      data: {
        global_crate_type_1_price: settings.global_crate_type_1_price,
        global_crate_type_2_price: settings.global_crate_type_2_price,
      },
    });
  } catch (error) {
    next(error);
  }
};
