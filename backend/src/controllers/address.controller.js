const addressService = require("../services/address.service");
const ApiResponse = require("../utils/response");

class AddressController {
  /**
   * GET /api/v1/addresses
   * Get all user addresses
   */
  async getAddresses(req, res, next) {
    try {
      const addresses = await addressService.getUserAddresses(req.user._id);
      return ApiResponse.success(res, addresses);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/addresses/:id
   * Get address by ID
   */
  async getAddress(req, res, next) {
    try {
      const address = await addressService.getById(req.params.id, req.user._id);
      return ApiResponse.success(res, address);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/addresses
   * Create new address
   */
  async createAddress(req, res, next) {
    try {
      const address = await addressService.create(req.user._id, req.body);
      return ApiResponse.created(res, address, "Address created successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/addresses/:id
   * Update address
   */
  async updateAddress(req, res, next) {
    try {
      const address = await addressService.update(
        req.params.id,
        req.user._id,
        req.body,
      );
      return ApiResponse.success(res, address, "Address updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/addresses/:id/default
   * Set address as default
   */
  async setDefault(req, res, next) {
    try {
      const address = await addressService.setDefault(
        req.params.id,
        req.user._id,
      );
      return ApiResponse.success(res, address, "Default address updated");
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/addresses/:id
   * Delete address
   */
  async deleteAddress(req, res, next) {
    try {
      const result = await addressService.delete(req.params.id, req.user._id);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
