import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { Address } from "../models/address.model.js";

export const createOrder = async (req, res) => {
  try {
    const { items, total, paymentMethod, deliveryDetails, expectedDeliveryDate } = req.body;
    const user = req.userId;
    const userDoc = await User.findById(user);
    if (!userDoc) return res.status(404).json({ success: false, message: "User not found" });
    const userId = userDoc._id.toString();

    // Save address if not already present for this user
    const addressQuery = {
      user,
      addressLine1: deliveryDetails.addressLine1,
      city: deliveryDetails.city,
      state: deliveryDetails.state,
      pincode: deliveryDetails.pincode
    };
    let address = await Address.findOne(addressQuery);
    if (!address) {
      address = new Address({ ...deliveryDetails, user });
      await address.save();
    }

    const order = new Order({
      user,
      userId,
      items,
      total,
      status: "pending",
      paymentMethod,
      deliveryDetails,
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    });
    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const user = req.userId;
    const userDoc = await User.findById(user);
    if (!userDoc) return res.status(404).json({ success: false, message: "User not found" });
    let orders;
    if (userDoc.role === 'admin') {
      orders = await Order.find().sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user }).sort({ createdAt: -1 });
    }
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.userId;
    const userDoc = await User.findById(user);
    if (!userDoc) return res.status(404).json({ success: false, message: "User not found" });
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (userDoc.role !== 'admin' && order.user.toString() !== user) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.userId;
    console.log(`[updateOrderStatus] Called by user: ${user}, orderId: ${id}, status: ${status}`);
    const userDoc = await User.findById(user);
    if (!userDoc || userDoc.role !== 'admin') {
      console.log('[updateOrderStatus] Forbidden: not admin or user not found');
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    // Only allow valid statuses
    const validStatuses = ["pending", "processing", "delivered", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      console.log(`[updateOrderStatus] Invalid status: ${status}`);
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      console.log('[updateOrderStatus] Order not found');
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    console.log(`[updateOrderStatus] Order updated: ${order._id}, new status: ${order.status}`);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('[updateOrderStatus] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.userId;
    const userDoc = await User.findById(user);
    if (!userDoc || userDoc.role !== 'user') {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const order = await Order.findByIdAndDelete(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 