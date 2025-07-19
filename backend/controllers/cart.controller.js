import { Cart } from "../models/cart.model.js";
import mongoose from "mongoose";

// Get current user's cart
export const getCart = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('CartController getCart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add or update an item in the cart
export const addToCart = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const item = req.body;
    let cart = await Cart.findOne({ user: userId });
    console.log('Adding item:', item);
    if (!cart) {
      cart = new Cart({ user: userId, items: [item] });
      console.log('Cart before:', []);
    } else {
      console.log('Cart before:', cart.items);
      const existingItem = cart.items.find(i => i.id === item.id);
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        cart.items.push(item);
      }
    }
    await cart.save();
    console.log('Cart after:', cart.items);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('CartController addToCart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove an item from the cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const { id } = req.body;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    cart.items = cart.items.filter(i => i.id !== id);
    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('CartController removeFromCart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update quantity of an item in the cart
export const updateCartItem = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const { id, quantity } = req.body;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    const item = cart.items.find(i => i.id === id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found in cart" });
    item.quantity = quantity;
    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('CartController updateCartItem error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear the cart
export const clearCart = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    cart.items = [];
    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error('CartController clearCart error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}; 