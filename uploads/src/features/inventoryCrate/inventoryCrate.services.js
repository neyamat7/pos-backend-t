import mongoose from "mongoose";
import { getOrCreateDailyCash } from "../../utils/getDailyCash.js";
import { CashTransaction } from "../cash-management/cash-management.model.js";
import customerModel from "../customer/customer.model.js";
import supplierModel from "../supplier/supplier.model.js";
import { CrateProfit, CrateTotal, InventoryCrate } from "./inventoryCrate.model.js";

// @desc    Create a new crate transition
// @access  Admin
export const createCrateTransitionService = async (data) => {

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const crate_type_1_qty = data.crate_type_1_qty || 0;
    const crate_type_2_qty = data.crate_type_2_qty || 0;
    const crate_type_1_price = data.crate_type_1_price || 0;
    const crate_type_2_price = data.crate_type_2_price || 0;
    const { date, stockType, note, customerId } = data;

    // 1. Get or Create today's DailyCash record
    const dailyCash = await getOrCreateDailyCash(date, session);
    
    if (dailyCash.isClosed) {
      throw new Error("Daily cash record is closed for this date.");
    }

    let totalPayout = 0;
    let customer = null;

    // 2. Handle customer re-stock logic
    if (stockType === "re-stock" && customerId) {
      customer = await customerModel.findById(customerId).session(session);
      if (!customer) {
        throw new Error("Customer not found");
      }

      // Validate customer due limits
      if (crate_type_1_qty > (customer.crate_info.type_1 || 0)) {
        throw new Error(`Customer only owes ${customer.crate_info.type_1} Type 1 crates. Cannot return ${crate_type_1_qty}.`);
      }
      if (crate_type_2_qty > (customer.crate_info.type_2 || 0)) {
        throw new Error(`Customer only owes ${customer.crate_info.type_2} Type 2 crates. Cannot return ${crate_type_2_qty}.`);
      }

      let crateReturnValue = 0;
      const profitsToCreate = [];

      // Calculate Profit and Update Customer
      const handleCrateRestock = async (type, qty, restockPrice) => {
        if (qty <= 0) return;
        
        const customerPrice = customer.crate_info[type] ? customer.crate_info[`${type}_price`] : 0;
        const profitPerCrate = customerPrice - restockPrice;
        
        if (profitPerCrate > 0) {
          profitsToCreate.push({
            customerId,
            crate_type: type,
            quantity: qty,
            profitAmount: profitPerCrate * qty,
            date
          });
        }

        customer.crate_info[type] -= qty;
        crateReturnValue += (qty * restockPrice);
      };

      await handleCrateRestock("type_1", crate_type_1_qty, crate_type_1_price || 0);
      await handleCrateRestock("type_2", crate_type_2_qty, crate_type_2_price || 0);

      // Subtract return value from customer due first
      const currentDue = customer.account_info.due || 0;
      if (currentDue > 0) {
        const amountToSubtractFromDue = Math.min(currentDue, crateReturnValue);
        customer.account_info.due -= amountToSubtractFromDue;
        crateReturnValue -= amountToSubtractFromDue; // Remaining is actual cash payout
      }

      totalPayout = crateReturnValue;

      await customer.save({ session });

      // Store profitsToCreate in data for later use after transition creation
      data.profitsToCreate = profitsToCreate;
    }

    // 3. Handle new stock logic (Cash Out)
    if (stockType === "new") {
      totalPayout += (crate_type_1_qty * (crate_type_1_price || 0));
      totalPayout += (crate_type_2_qty * (crate_type_2_price || 0));
    }

    // 4. Update Daily Cash
    if (totalPayout > 0) {
      if (dailyCash.closingCash < totalPayout) {
        throw new Error(`Insufficient cash in drawer. Available: ${dailyCash.closingCash}, Required: ${totalPayout}`);
      }

      // Record Cash Transaction History
      await CashTransaction.create(
        [
          {
            businessDate: dailyCash.businessDate,
            type: "OUT",
            amount: totalPayout,
            source: "crate-transition",
            note: note || `Crate transition payout (${stockType})${customer ? ` to ${customer.basic_info.name}` : ""}`,
          },
        ],
        { session }
      );

      dailyCash.cashOut += totalPayout;
      dailyCash.closingCash -= totalPayout;
      await dailyCash.save({ session });
    }

    // 5. Create the crate transition
    const newTransition = await InventoryCrate.create(
      [
        {
          date,
          supplierId: null,
          customerId: customerId || null,
          stockType,
          crate_type_1_qty,
          crate_type_2_qty,
          crate_type_1_price: crate_type_1_price || 0,
          crate_type_2_price: crate_type_2_price || 0,
          status: "IN",
          note: note || `Crate Re-stock from ${customer?.basic_info?.name || customerId}`,
        },
      ],
      { session }
    );

    // 5.1 Create Profit Records if any
    if (data.profitsToCreate && data.profitsToCreate.length > 0) {
      const profitsWithRef = data.profitsToCreate.map(p => ({
        ...p,
        referenceId: newTransition[0]._id
      }));
      await CrateProfit.create(profitsWithRef, { session, ordered: true });
    }

    // 6. Update Inventory Totals
    let totals = await CrateTotal.findOne().session(session);
    if (!totals) {
      totals = await CrateTotal.create([{}], { session });
      totals = totals[0];
    }

    if (stockType === "new") {
      totals.type_1_total += crate_type_1_qty;
      totals.type_1_total_cost += (crate_type_1_qty * (crate_type_1_price || 0));
      totals.type_2_total += crate_type_2_qty;
      totals.type_2_total_cost += (crate_type_2_qty * (crate_type_2_price || 0));
    }

    totals.remaining_type_1 += crate_type_1_qty;
    totals.remaining_type_2 += crate_type_2_qty;

    await totals.save({ session });

    await session.commitTransaction();
    session.endSession();

    return newTransition[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// @desc    Get all crate transitions
// @access  Admin
export const getAllCrateTransitionsService = async (page, limit, search = '') => {
  const skip = (page - 1) * limit;

  // Build search filter
  const searchFilter = {};
  if (search) {
    const regex = new RegExp(search, 'i'); // case-insensitive search
    searchFilter.$or = [
      { 'supplierId.basic_info.name': regex },
      { 'customerId.basic_info.name': regex }
    ];
  }

  const transitions = await InventoryCrate.find()
    .populate("supplierId", "basic_info.name contact_info crate_info")
    .populate("customerId", "basic_info.name contact_info crate_info")
    .then(docs => {
      // Apply search filter after population
      if (search) {
        const regex = new RegExp(search, 'i');
        return docs.filter(doc => {
          const supplierName = doc.supplierId?.basic_info?.name || '';
          const customerName = doc.customerId?.basic_info?.name || '';
          return regex.test(supplierName) || regex.test(customerName);
        });
      }
      return docs;
    })
    .then(filtered => {
      // Apply pagination after filtering
      const total = filtered.length;
      const paginated = filtered
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(skip, skip + limit);
      
      return {
        transitions: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    });

  return transitions;
};

// @desc    Add crates for a supplier and update totals
// @access  Admin
export const addCratesForSupplierService = async (supplierId, crate_info) => {
  const crate1 = crate_info.crate1 || 0;
  const crate2 = crate_info.crate2 || 0;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Get supplier and warehouse totals
    const supplier = await supplierModel.findById(supplierId).session(session);
    if (!supplier) throw new Error("Supplier not found");

    let totals = await CrateTotal.findOne().session(session);
    if (!totals) {
      totals = await CrateTotal.create([{}], { session });
      totals = totals[0];
    }

    // 2. Validate Warehouse Stock
    if ((totals.remaining_type_1 || 0) < crate1) {
      throw new Error(`Insufficient Type 1 crates in warehouse. Available: ${totals.remaining_type_1}, Required: ${crate1}`);
    }
    if ((totals.remaining_type_2 || 0) < crate2) {
      throw new Error(`Insufficient Type 2 crates in warehouse. Available: ${totals.remaining_type_2}, Required: ${crate2}`);
    }

    // 3. Update supplier crate info (Debt-first logic)
    const updateSupplierCrate = (type, qty) => {
      if (qty <= 0) return;
      
      const needToGiveKey = type === "crate1" ? "needToGiveCrate1" : "needToGiveCrate2";
      const currentNeedToGive = supplier.crate_info[needToGiveKey] || 0;

      if (currentNeedToGive > 0) {
        const amountToSubtractFromNeed = Math.min(currentNeedToGive, qty);
        supplier.crate_info[needToGiveKey] -= amountToSubtractFromNeed;
        const remainingQty = qty - amountToSubtractFromNeed;
        if (remainingQty > 0) {
          supplier.crate_info[type] += remainingQty;
        }
      } else {
        supplier.crate_info[type] += qty;
      }
    };

    updateSupplierCrate("crate1", crate1);
    updateSupplierCrate("crate2", crate2);

    if (crate_info.crate1Price !== undefined) {
      supplier.crate_info.crate1Price = crate_info.crate1Price;
    }
    if (crate_info.crate2Price !== undefined) {
      supplier.crate_info.crate2Price = crate_info.crate2Price;
    }

    await supplier.save({ session });

    // 4. Update Warehouse Totals
    totals.remaining_type_1 -= crate1;
    totals.remaining_type_2 -= crate2;
    await totals.save({ session });

    // 5. Create InventoryCrate record
    const inventoryCrate = await InventoryCrate.create(
      [
        {
          date: new Date().toISOString().split("T")[0],
          supplierId,
          crate_type_1_qty: crate1,
          crate_type_2_qty: crate2,
          status: "OUT",
          note: `Crates sent to supplier ${supplier.basic_info?.name || supplierId}`,
        },
      ],
      { session }
    );

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    return { supplier, inventoryCrate: inventoryCrate[0], totals };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// @desc    Update supplier crate info OR update total and customer restock crates if no supplier
// @access  Admin
export const updateCrateOrSupplierService = async (
  supplierId,
  inventoryCratesId,
  crate_info
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get or create totals
    let totals = await CrateTotal.findOne().session(session);
    if (!totals) {
      totals = await CrateTotal.create([{}], { session });
      totals = totals[0];
    }

    // CASE 1: Updating an existing InventoryCrate record (Correction)
    if (inventoryCratesId) {
      // Find existing InventoryCrate document
      const inventory = await InventoryCrate.findById(inventoryCratesId).session(session);
      if (!inventory) {
        throw new Error("InventoryCrate record not found");
      }

      // Previous values from the record
      const prev1 = inventory.crate_type_1_qty || 0;
      const prev2 = inventory.crate_type_2_qty || 0;
      const prevPrice1 = inventory.crate_type_1_price || 0;
      const prevPrice2 = inventory.crate_type_2_price || 0;

      // New values from the request
      const new1 = crate_info.crate1 ?? prev1;
      const new2 = crate_info.crate2 ?? prev2;
      const newPrice1 = crate_info.crate1Price ?? prevPrice1;
      const newPrice2 = crate_info.crate2Price ?? prevPrice2;

      const diff1 = new1 - prev1;
      const diff2 = new2 - prev2;

      // 1. Handle Supplier Adjustment (if record belongs to a supplier)
      if (inventory.supplierId) {
        const supplier = await supplierModel.findById(inventory.supplierId).session(session);
        if (!supplier) throw new Error("Supplier not found");

        const applySupplierDiff = (type, diff) => {
          if (diff === 0) return;
          const needToGiveKey = type === "crate1" ? "needToGiveCrate1" : "needToGiveCrate2";
          
          if (diff > 0) {
            // Sent MORE crates: Clear our debt first
            let remainingDiff = diff;
            const canClear = Math.min(supplier.crate_info[needToGiveKey] || 0, remainingDiff);
            supplier.crate_info[needToGiveKey] -= canClear;
            remainingDiff -= canClear;
            supplier.crate_info[type] += remainingDiff;
          } else {
            // Sent FEWER crates: Reduce their debt first, then add to our debt
            let remainingDiff = Math.abs(diff);
            const canClear = Math.min(supplier.crate_info[type] || 0, remainingDiff);
            supplier.crate_info[type] -= canClear;
            remainingDiff -= canClear;
            supplier.crate_info[needToGiveKey] += remainingDiff;
          }
        };

        applySupplierDiff("crate1", diff1);
        applySupplierDiff("crate2", diff2);
        await supplier.save({ session });
      }

      // 2. Handle Customer Adjustment (if record belongs to a customer)
      else if (inventory.customerId) {
        const dailyCash = await getOrCreateDailyCash(inventory.date, session);
        if (dailyCash.isClosed) throw new Error("Daily cash record is closed for this date.");

        const customer = await customerModel.findById(inventory.customerId).session(session);
        if (!customer) throw new Error("Customer not found");

        // Revert old quantities from customer
        customer.crate_info.type_1 += prev1;
        customer.crate_info.type_2 += prev2;

        // Apply new quantities
        if (new1 > (customer.crate_info.type_1 || 0)) throw new Error(`Customer only owes ${customer.crate_info.type_1} Type 1 crates.`);
        if (new2 > (customer.crate_info.type_2 || 0)) throw new Error(`Customer only owes ${customer.crate_info.type_2} Type 2 crates.`);

        customer.crate_info.type_1 -= new1;
        customer.crate_info.type_2 -= new2;

        // Re-calculate Profit
        await CrateProfit.deleteMany({ referenceId: inventory._id }).session(session);
        const calculateNewProfit = (type, qty, price) => {
          if (qty <= 0) return 0;
          const custPrice = customer.crate_info[`${type}_price`] || 0;
          const profit = custPrice - price;
          return profit > 0 ? profit * qty : 0;
        };

        const profit1 = calculateNewProfit("type_1", new1, newPrice1);
        const profit2 = calculateNewProfit("type_2", new2, newPrice2);

        if (profit1 > 0 || profit2 > 0) {
          const profits = [];
          if (profit1 > 0) profits.push({ customerId: customer._id, crate_type: "type_1", quantity: new1, profitAmount: profit1, date: inventory.date, referenceId: inventory._id });
          if (profit2 > 0) profits.push({ customerId: customer._id, crate_type: "type_2", quantity: new2, profitAmount: profit2, date: inventory.date, referenceId: inventory._id });
          await CrateProfit.create(profits, { session, ordered: true });
        }

        // Re-calculate Payout difference
        const oldTotalValue = (prev1 * prevPrice1) + (prev2 * prevPrice2);
        const newTotalValue = (new1 * newPrice1) + (new2 * newPrice2);
        const valueDiff = newTotalValue - oldTotalValue;
        
        let payoutDiff = 0;
        if (valueDiff > 0) {
            const currentDue = customer.account_info.due || 0;
            const toDue = Math.min(currentDue, valueDiff);
            customer.account_info.due -= toDue;
            payoutDiff = valueDiff - toDue;
        } else if (valueDiff < 0) {
            customer.account_info.due += Math.abs(valueDiff);
            payoutDiff = 0;
        }

        if (payoutDiff !== 0) {
          if (payoutDiff > 0 && dailyCash.closingCash < payoutDiff) {
            throw new Error(`Insufficient cash in drawer. Available: ${dailyCash.closingCash}, Required: ${payoutDiff}`);
          }
          await CashTransaction.create([{
            businessDate: dailyCash.businessDate,
            type: payoutDiff > 0 ? "OUT" : "IN",
            amount: Math.abs(payoutDiff),
            source: "crate-transition",
            note: `Adjustment for re-stock update (${inventory._id})`
          }], { session });

          dailyCash.cashOut += payoutDiff;
          dailyCash.closingCash -= payoutDiff;
          await dailyCash.save({ session });
        }

        await customer.save({ session });
      }

      // 3. Handle "New Stock" Adjustment (if no supplier/customer)
      else if (inventory.stockType === "new") {
        const dailyCash = await getOrCreateDailyCash(inventory.date, session);
        if (dailyCash.isClosed) throw new Error("Daily cash record is closed for this date.");

        const oldCost = (prev1 * prevPrice1) + (prev2 * prevPrice2);
        const newCost = (new1 * newPrice1) + (new2 * newPrice2);
        const payoutDiff = newCost - oldCost;

        if (payoutDiff !== 0) {
          if (payoutDiff > 0 && dailyCash.closingCash < payoutDiff) {
            throw new Error(`Insufficient cash in drawer. Available: ${dailyCash.closingCash}, Required: ${payoutDiff}`);
          }
          await CashTransaction.create([{
            businessDate: dailyCash.businessDate,
            type: payoutDiff > 0 ? "OUT" : "IN",
            amount: Math.abs(payoutDiff),
            source: "crate-transition",
            note: `Adjustment for new stock update (${inventory._id})`
          }], { session });

          dailyCash.cashOut += payoutDiff;
          dailyCash.closingCash -= payoutDiff;
          await dailyCash.save({ session });
        }

        totals.type_1_total_cost += (new1 * newPrice1) - (prev1 * prevPrice1);
        totals.type_2_total_cost += (new2 * newPrice2) - (prev2 * prevPrice2);
      }

      // 4. Update Warehouse Totals
      if (inventory.stockType === "new") {
        totals.type_1_total += diff1;
        totals.type_2_total += diff2;
      }
      
      // If status is OUT (sending crates), a positive diff means more left the warehouse
      // If status is IN (receiving crates), a positive diff means more entered the warehouse
      if (inventory.status === "OUT") {
        totals.remaining_type_1 -= diff1;
        totals.remaining_type_2 -= diff2;
      } else {
        totals.remaining_type_1 += diff1;
        totals.remaining_type_2 += diff2;
      }
      
      await totals.save({ session });

      // 5. Update the existing inventory document
      inventory.crate_type_1_qty = new1;
      inventory.crate_type_2_qty = new2;
      inventory.crate_type_1_price = newPrice1;
      inventory.crate_type_2_price = newPrice2;
      inventory.isUpdated = true;

      // Note & Status Logic (Original vs Latest)
      const originalMarker = "(Original:";
      const updatedMarker = "(Updated:";

      if (new1 === 0 && new2 === 0) {
        inventory.status = "CANCELLED";
        if (!inventory.note.includes("[CANCELLED]")) {
          inventory.note = `[CANCELLED] ${inventory.note}`;
        }
      } else {
        // Restore status if it was cancelled
        if (inventory.status === "CANCELLED") {
          inventory.status = inventory.supplierId ? "OUT" : "IN";
        }
        inventory.note = inventory.note.replace("[CANCELLED] ", "");
      }

      if (diff1 !== 0 || diff2 !== 0) {
        if (!inventory.note.includes(originalMarker)) {
          // First time updating this record
          const originalPart = `${originalMarker} T1:${prev1}, T2:${prev2})`;
          const updatedPart = `${updatedMarker} T1:${new1}, T2:${new2})`;
          inventory.note = `${inventory.note} ${originalPart} ${updatedPart}`;
        } else {
          // Already has an original marker, just update the "Updated" part
          const updatedPart = `${updatedMarker} T1:${new1}, T2:${new2})`;
          // Replace the existing (Updated: ...) part
          inventory.note = inventory.note.replace(/\(Updated: [^)]*\)/, updatedPart);
        }
      }

      await inventory.save({ session });

      await session.commitTransaction();
      session.endSession();

      return {
        message: "Inventory crate updated and totals adjusted successfully",
        totals,
        inventory,
      };
    }

    // CASE 2: SupplierId provided → update supplier and totals
    const supplier = await supplierModel.findById(supplierId).session(session);
    if (!supplier) {
      throw new Error("Supplier not found");
    }

    const prevCrate1 = supplier.crate_info.crate1 || 0;
    const prevCrate2 = supplier.crate_info.crate2 || 0;

    const newCrate1 = crate_info.crate1 ?? prevCrate1;
    const newCrate2 = crate_info.crate2 ?? prevCrate2;

    const diff1 = newCrate1 - prevCrate1; // positive = taking more
    const diff2 = newCrate2 - prevCrate2;

    // Validation
    if (diff1 > 0 && totals.remaining_type_1 < diff1) {
      throw new Error(
        `Not enough Type 1 crates. Available: ${totals.remaining_type_1}`
      );
    }
    if (diff2 > 0 && totals.remaining_type_2 < diff2) {
      throw new Error(
        `Not enough Type 2 crates. Available: ${totals.remaining_type_2}`
      );
    }

    // Update totals
    totals.remaining_type_1 -= diff1;
    totals.remaining_type_2 -= diff2;

    await totals.save({ session });

    // Update supplier info (Net Balance Logic)
    const applySupplierDiff = (type, diff) => {
      if (diff === 0) return;
      
      const needToGiveKey = type === "crate1" ? "needToGiveCrate1" : "needToGiveCrate2";
      
      if (diff > 0) {
        // Increasing supplier debt / Clearing our debt
        let remainingDiff = diff;
        const canClear = Math.min(supplier.crate_info[needToGiveKey] || 0, remainingDiff);
        supplier.crate_info[needToGiveKey] -= canClear;
        remainingDiff -= canClear;
        supplier.crate_info[type] += remainingDiff;
      } else {
        // Decreasing supplier debt / Supplier returning / Increasing our debt
        let remainingDiff = Math.abs(diff);
        const canClear = Math.min(supplier.crate_info[type] || 0, remainingDiff);
        supplier.crate_info[type] -= canClear;
        remainingDiff -= canClear;
        supplier.crate_info[needToGiveKey] += remainingDiff;
      }
    };

    applySupplierDiff("crate1", diff1);
    applySupplierDiff("crate2", diff2);

    if (crate_info.crate1Price !== undefined) {
      supplier.crate_info.crate1Price = crate_info.crate1Price;
    }
    if (crate_info.crate2Price !== undefined) {
      supplier.crate_info.crate2Price = crate_info.crate2Price;
    }

    await supplier.save({ session });

    // Create a history record for the manual adjustment
    let status = diff1 + diff2 > 0 ? "OUT" : "IN";
    let note = `Manual Balance Adjustment for ${supplier.basic_info?.name || supplierId}`;
    
    // Check if balance was zeroed out
    const isZeroed = supplier.crate_info.crate1 === 0 && 
                     supplier.crate_info.crate2 === 0 && 
                     supplier.crate_info.needToGiveCrate1 === 0 && 
                     supplier.crate_info.needToGiveCrate2 === 0;

    if (isZeroed) {
      status = "CANCELLED";
      note = `[CANCELLED] ${note} (Was: Crate1: ${prevCrate1}, Crate2: ${prevCrate2})`;
    } else {
      note += ` (Crate1: ${prevCrate1} -> ${supplier.crate_info.crate1}, Crate2: ${prevCrate2} -> ${supplier.crate_info.crate2})`;
    }

    await InventoryCrate.create(
      [
        {
          date: new Date().toISOString().split("T")[0],
          supplierId,
          crate_type_1_qty: Math.abs(diff1),
          crate_type_2_qty: Math.abs(diff2),
          status,
          note,
          isUpdated: true,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      message: "Supplier crate info and totals updated successfully",
      supplier,
      totals,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(error.message);
  }
};

// @desc  Get the current crate totals. Creates default if missing.
// @access  Admin
export const getCrateTotalsService = async (year, month) => {
  let totals = await CrateTotal.findOne();

  if (!totals) {
    totals = await CrateTotal.create({});
  }

  // Calculate period_new_stock_cost
  const currentYear = new Date().getFullYear();
  const filterYear = year || currentYear;
  
  let dateFilter = `^${filterYear}-`;
  if (month) {
    const formattedMonth = month.toString().padStart(2, '0');
    dateFilter = `^${filterYear}-${formattedMonth}-`;
  }

  const aggregation = await InventoryCrate.aggregate([
    {
      $match: {
        stockType: "new",
        status: { $ne: "CANCELLED" },
        date: { $regex: dateFilter }
      }
    },
    {
      $group: {
        _id: null,
        type_1_total: { $sum: { $ifNull: ["$crate_type_1_qty", 0] } },
        type_1_total_cost: {
          $sum: { $multiply: [{ $ifNull: ["$crate_type_1_qty", 0] }, { $ifNull: ["$crate_type_1_price", 0] }] }
        },
        type_2_total: { $sum: { $ifNull: ["$crate_type_2_qty", 0] } },
        type_2_total_cost: {
          $sum: { $multiply: [{ $ifNull: ["$crate_type_2_qty", 0] }, { $ifNull: ["$crate_type_2_price", 0] }] }
        },
        grand_total_cost: {
          $sum: {
            $add: [
              { $multiply: [{ $ifNull: ["$crate_type_1_qty", 0] }, { $ifNull: ["$crate_type_1_price", 0] }] },
              { $multiply: [{ $ifNull: ["$crate_type_2_qty", 0] }, { $ifNull: ["$crate_type_2_price", 0] }] }
            ]
          }
        }
      }
    }
  ]);

  const period_new_stock = aggregation.length > 0 ? {
    type_1_total: aggregation[0].type_1_total,
    type_1_total_cost: aggregation[0].type_1_total_cost,
    type_2_total: aggregation[0].type_2_total,
    type_2_total_cost: aggregation[0].type_2_total_cost,
    grand_total_cost: aggregation[0].grand_total_cost
  } : {
    type_1_total: 0,
    type_1_total_cost: 0,
    type_2_total: 0,
    type_2_total_cost: 0,
    grand_total_cost: 0
  };

  return {
    lifetime_totals: totals,
    period_new_stock,
    filter: {
      year: filterYear,
      month: month || null
    }
  };
};

// @desc Get total crate profit by month
// @access  Admin
export const getTotalCrateProfitByMonth = async (monthName, year) => {
  // Step 1: Determine the year (use provided year or current year)
  const targetYear = year || new Date().getFullYear();
  
  // Step 2: Parse the month name to get month index (0-11)
  let monthIndex;
  if (monthName) {
    // Convert month name (e.g., "January") to month index (0)
    monthIndex = new Date(`${monthName} 1, ${targetYear}`).getMonth();
  } else {
    // If no month provided, use current month
    monthIndex = new Date().getMonth();
  }

  // Step 3: Build the date range for the entire month
  // Start date: First day of month at 00:00:00
  const startDate = new Date(targetYear, monthIndex, 1);
  // End date: Last day of month at 23:59:59.999
  const endDate = new Date(targetYear, monthIndex + 1, 0, 23, 59, 59, 999);

  // Step 4: Query CrateProfit model and sum all profitAmount for the month
  // Filter by date field (string format) and aggregate the profit amounts
  const crateProfitResult = await CrateProfit.aggregate([
    {
      // Match crate profit records within the date range
      $match: {
        // Convert string date to Date object for comparison
        $expr: {
          $and: [
            { $gte: [{ $dateFromString: { dateString: "$date" } }, startDate] },
            { $lte: [{ $dateFromString: { dateString: "$date" } }, endDate] }
          ]
        }
      }
    },
    {
      // Group and sum all profit amounts
      $group: {
        _id: null,
        totalCrateProfit: { $sum: "$profitAmount" },
        totalQuantity: { $sum: "$quantity" },  // Also track total quantity
        // Count by crate type
        type1Count: {
          $sum: {
            $cond: [{ $eq: ["$crate_type", "type_1"] }, "$quantity", 0]
          }
        },
        type2Count: {
          $sum: {
            $cond: [{ $eq: ["$crate_type", "type_2"] }, "$quantity", 0]
          }
        },
        type1Profit: {
          $sum: {
            $cond: [{ $eq: ["$crate_type", "type_1"] }, "$profitAmount", 0]
          }
        },
        type2Profit: {
          $sum: {
            $cond: [{ $eq: ["$crate_type", "type_2"] }, "$profitAmount", 0]
          }
        }
      }
    }
  ]);

  // Step 5: Extract results (default to 0 if no records found)
  const result = crateProfitResult[0] || {
    totalCrateProfit: 0,
    totalQuantity: 0,
    type1Count: 0,
    type2Count: 0,
    type1Profit: 0,
    type2Profit: 0
  };

  // Step 6: Return the crate profit data with breakdown
  return {
    totalCrateProfit: result.totalCrateProfit,  // Total profit from all crate transactions
    totalQuantity: result.totalQuantity,        // Total crates returned
    breakdown: {
      type1: {
        quantity: result.type1Count,            // Type 1 crate count
        profit: result.type1Profit              // Type 1 profit
      },
      type2: {
        quantity: result.type2Count,            // Type 2 crate count
        profit: result.type2Profit              // Type 2 profit
      }
    },
    month: monthName || new Date(targetYear, monthIndex).toLocaleString('en-US', { month: 'long' }),
    year: targetYear
  };
};
