const returnService = require("../services/return.service");

/**
 * Get all returns (Admin)
 */
exports.getAll = async (req, res, next) => {
  try {
    const result = await returnService.getAll(req.query);
    res.json({
      success: true,
      data: result.returns,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's returns
 */
exports.getMyReturns = async (req, res, next) => {
  try {
    const returns = await returnService.getByUserId(req.user._id);
    res.json({ success: true, data: returns });
  } catch (error) {
    next(error);
  }
};

/**
 * Get return by ID
 */
exports.getById = async (req, res, next) => {
  try {
    const userId = req.user.role === "admin" ? null : req.user._id;
    const returnRequest = await returnService.getById(req.params.id, userId);
    res.json({ success: true, data: returnRequest });
  } catch (error) {
    next(error);
  }
};

/**
 * Create return request
 */
exports.create = async (req, res, next) => {
  try {
    const returnRequest = await returnService.create(req.user._id, req.body);
    res.status(201).json({ success: true, data: returnRequest });
  } catch (error) {
    next(error);
  }
};

/**
 * Update return status (Admin)
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const returnRequest = await returnService.updateStatus(
      req.params.id,
      status,
      adminNotes,
    );
    res.json({ success: true, data: returnRequest });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel return request
 */
exports.cancel = async (req, res, next) => {
  try {
    const result = await returnService.cancel(req.params.id, req.user._id);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};
