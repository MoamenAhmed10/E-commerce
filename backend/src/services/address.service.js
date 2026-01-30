const Address = require("../models/address.model");

class AddressService {
  /**
   * Get all addresses for a user
   */
  async getUserAddresses(userId) {
    return Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  /**
   * Get address by ID
   */
  async getById(addressId, userId) {
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      const error = new Error("Address not found");
      error.statusCode = 404;
      throw error;
    }
    return address;
  }

  /**
   * Create new address
   */
  async create(userId, addressData) {
    // If this is the first address or marked as default, set it as default
    const existingAddresses = await Address.countDocuments({ userId });
    const isDefault = existingAddresses === 0 || addressData.isDefault;

    const address = new Address({
      userId,
      ...addressData,
      isDefault,
    });

    await address.save();
    return address;
  }

  /**
   * Update address
   */
  async update(addressId, userId, updateData) {
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      const error = new Error("Address not found");
      error.statusCode = 404;
      throw error;
    }

    Object.assign(address, updateData);
    await address.save();
    return address;
  }

  /**
   * Set address as default
   */
  async setDefault(addressId, userId) {
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      const error = new Error("Address not found");
      error.statusCode = 404;
      throw error;
    }

    address.isDefault = true;
    await address.save();
    return address;
  }

  /**
   * Soft delete address
   */
  async delete(addressId, userId) {
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      const error = new Error("Address not found");
      error.statusCode = 404;
      throw error;
    }

    address.isDeleted = true;
    await address.save();

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    return { message: "Address deleted successfully" };
  }
}

module.exports = new AddressService();
