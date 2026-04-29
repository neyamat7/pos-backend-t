import * as paymentService from "./payment.services.js";

// @desc    Create transaction
// @route   POST /api/v1/payments/add/
// @access  Admin
export const createTransaction = async (req, res, next) => {
  // console.log('req.body in payment controller', req.body);

  try {
    const userId = req.user.id;

    const result = await paymentService.createTransaction(req.body, { by: userId });

    const transaction = result.payment;

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transaction by supplier
// @route   GET /api/v1/payments/all/:supplierId
// @access  Admin
export const getAllBySupplier = async (req, res, next) => {
  try {
    const { supplierId } = req.params;

    const { page = 1, limit = 10, fromDate, toDate } = req.query;

    const transactions = await paymentService.getPaymentsBySupplier(
      supplierId,
      parseInt(page),
      parseInt(limit),
      {
        fromDate,
        toDate,
      }
    );

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    view details information
// @route   GET /api/v1/payments/details/:id
// @access  Admin
export const getTransactionDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await paymentService.getPaymentById(id);

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear full supplier settlement
// @route   POST /api/v1/payments/settlement
// @access  Admin
export const clearSupplierSettlementController = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await paymentService.clearSupplierSettlement(req.body, { by: userId });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
