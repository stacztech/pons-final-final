import { Address } from "../models/address.model.js";

export const createAddress = async (req, res) => {
  try {
    const user = req.userId;
    const data = req.body;
    // If this is the first address, set as default
    const existing = await Address.find({ user });
    const isDefault = existing.length === 0;
    const address = new Address({ ...data, user, isDefault });
    await address.save();
    res.status(201).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const user = req.userId;
    const addresses = await Address.find({ user }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.userId;
    const address = await Address.findById(id);
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });
    if (address.user.toString() !== user) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    res.status(200).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.userId;
    const data = req.body;

    const address = await Address.findOne({ _id: id, user: user });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found or permission denied" });
    }

    // If setting this address as default, unset other defaults
    if (data.isDefault === true) {
      await Address.updateMany({ user: user, _id: { $ne: id } }, { isDefault: false });
    }

    const updatedAddress = await Address.findByIdAndUpdate(id, data, { new: true });
    res.status(200).json({ success: true, address: updatedAddress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.userId;
    const address = await Address.findById(id);
    if (!address) return res.status(404).json({ success: false, message: "Address not found" });
    if (address.user.toString() !== user) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    await Address.findByIdAndDelete(id);
    // If deleted address was default, set another as default
    if (address.isDefault) {
      const another = await Address.findOne({ user: address.user });
      if (another) {
        another.isDefault = true;
        await another.save();
      }
    }
    res.status(200).json({ success: true, message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const user = req.userId;
    const { id } = req.params;
    // Set all of the user's other addresses to isDefault: false
    await Address.updateMany({ user: user, _id: { $ne: id } }, { isDefault: false });
    // Set selected address to isDefault: true, only if it belongs to the user
    const address = await Address.findOneAndUpdate(
      { _id: id, user: user },
      { isDefault: true },
      { new: true }
    );
    if (!address) return res.status(404).json({ success: false, message: "Address not found or does not belong to user" });
    res.status(200).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 