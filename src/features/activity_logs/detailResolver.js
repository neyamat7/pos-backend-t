import Account from "../account/account.model.js";
import Balance from "../balance/balance.model.js";
import Category from "../categories/categories.model.js";
import Customer from "../customer/customer.model.js";
import Expense from "../expense/expense.model.js";
import { InventoryCrate } from "../inventoryCrate/inventoryCrate.model.js";
import Payment from "../payment/payment.model.js";
import Product from "../products/products.model.js";
import Purchase from "../purchase/purchase.model.js";
import Sale from "../sale/sale.model.js";
import Supplier from "../supplier/supplier.model.js";

/**
 * Maps model_name → { model, populate }
 * Returns null for unrecognized model names.
 *
 * @param {String} modelName
 * @returns {{ model: import('mongoose').Model, populate: Array } | null}
 */
export const getResolverConfig = (modelName) => {
  const resolverMap = {
    Sale: {
      model: Sale,
      populate: [
        { path: "customerId" },
        { path: "items.productId" },
        { path: "items.selected_lots.lotId" },
      ],
    },
    Purchase: {
      model: Purchase,
      populate: [
        { path: "items.supplier" },
        { path: "items.lots.productId" },
      ],
    },
    Balance: {
      model: Balance,
      populate: [],
    },
    Payment: {
      model: Payment,
      populate: [
        { path: "supplierId" },
        { path: "selected_lots_info.lot_id" },
      ],
    },
    InventoryCrate: {
      model: InventoryCrate,
      populate: [
        { path: "customerId" },
        { path: "supplierId" },
      ],
    },
    Expense: {
      model: Expense,
      populate: [
        { path: "expense_by" },
        { path: "choose_account" },
      ],
    },
    Customer: {
      model: Customer,
      populate: [],
    },
    Supplier: {
      model: Supplier,
      populate: [],
    },
    Product: {
      model: Product,
      populate: [{ path: "categoryId" }],
    },
    Category: {
      model: Category,
      populate: [],
    },
    Account: {
      model: Account,
      populate: [],
    },
  };

  return resolverMap[modelName] ?? null;
};

/**
 * Fetches and populates the related document for an ActivityLog entry.
 *
 * @param {String}   modelName  - ActivityLog.model_name
 * @param {*}        documentId - ActivityLog.logs_fields_id
 * @returns {Promise<Object|null>} - populated document or null
 */
export const resolveDetail = async (modelName, documentId) => {
  const config = getResolverConfig(modelName);

  if (!config) {
    return null;
  }

  const { model, populate } = config;

  let query = model.findById(documentId);

  if (populate.length > 0) {
    query = query.populate(populate);
  }

  const document = await query.lean();

  return document ?? null;
};
