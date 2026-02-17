import mongoose from "mongoose";
import Customer from "../customer/customer.model.js";
import { CrateTotal } from "../inventoryCrate/inventoryCrate.model.js";
import CustomerCrateHistory from "./customerCrateHistory.model.js";

// @desc Get all crate history for a customer (status: given first)
// @access private
export const getCustomerCrateHistory = async (customerId, page, limit) => {
  const skip = (page - 1) * limit;

  const total = await CustomerCrateHistory.countDocuments({ customerId });
  const history = await CustomerCrateHistory.find({ customerId })
    .populate(
      "customerId",
      "basic_info.name contact_info.phone contact_info.email"
    )
    .populate({
      path: "saleId",
      select: "sale_date",
    })
    .lean()
    // .populate("saleId", "sale_date")
    .sort({ status: 1, createdAt: -1 }) // given -> partial_return -> returned
    .skip(skip)
    .limit(limit);

  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    history,
  };
};
// @desc Get full details of one crate history
// @access private
export const getSingleCrateHistory = async (id) => {
  return await CustomerCrateHistory.findById(id)
    .populate("customerId", "name phone")
    .populate("saleId"); // full sale details
};

// @desc Update crate return status
// @access private
export const updateCrateStatus = async (id, status) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Fetch the crate history record
    const crateHistory =
      await CustomerCrateHistory.findById(id).session(session);

    if (!crateHistory) {
      throw new Error("Crate history record not found");
    }

    // Step 2: Check if status is being changed to "returned"
    if (status === "returned" && crateHistory.status !== "returned") {
      const customerId = crateHistory.customerId;
      const crateType1Qty = parseInt(crateHistory.crate_type1) || 0;
      const crateType2Qty = parseInt(crateHistory.crate_type2) || 0;

      // Step 3: Update Customer Collection (Subtract crates)
      const customer = await Customer.findById(customerId).session(session);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Calculate new quantities ensuring they don't go below zero
      const newType1Qty = Math.max(
        0,
        (customer.crate_info.type_1 || 0) - crateType1Qty
      );
      const newType2Qty = Math.max(
        0,
        (customer.crate_info.type_2 || 0) - crateType2Qty
      );

      await Customer.findByIdAndUpdate(
        customerId,
        {
          $set: {
            "crate_info.type_1": newType1Qty,
            "crate_info.type_2": newType2Qty,
          },
        },
        { session }
      ); 

      // Step 4: Update Crate Totals Collection (Add to remaining)
      const crateTotals = await CrateTotal.findOne().session(session);
      if (!crateTotals) {
        throw new Error("Crate totals record not found");
      }

      await CrateTotal.findOneAndUpdate(
        {},
        {
          $inc: {
            remaining_type_1: crateType1Qty,
            remaining_type_2: crateType2Qty,
          },
        },
        { session, new: true }
      );

      // console.log(
      //   `Crates returned: Type1=${crateType1Qty}, Type2=${crateType2Qty}`
      // );
      // console.log(
      //   `Customer ${customerId} crates updated: Type1=${newType1Qty}, Type2=${newType2Qty}`
      // );
    }

    // Step 5: Update Crate History Status (always update status)
    const updatedCrateHistory = await CustomerCrateHistory.findByIdAndUpdate(
      id,
      { status },
      { new: true, session }
    )
      .populate("customerId", "basic_info.name")
      .populate("saleId", "sale_date");

    // Commit the transaction
    await session.commitTransaction();

    // Step 7: Return updated data
    return {
      success: true,
      data: updatedCrateHistory,
      message:
        status === "returned"
          ? "Crates returned successfully"
          : "Status updated successfully",
    };
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();

    console.error("Error updating crate status:", error);

    return {
      success: false,
      error: error.message || "Failed to update crate status",
    };
  } finally {
    // End the session
    session.endSession();
  }
};
