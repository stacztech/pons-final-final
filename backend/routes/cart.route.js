import express from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  addMultipleToCart
} from "../controllers/cart.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getCart);
router.post("/add", verifyToken, addToCart);
router.post("/remove", verifyToken, removeFromCart);
router.post("/update", verifyToken, updateCartItem);
router.post("/clear", verifyToken, clearCart);
router.post("/add-multiple", verifyToken, addMultipleToCart);

export default router; 