import express from "express";
import {
	login,
	logout,
	signup,
	verifyEmail,
	forgotPassword,
	resetPassword,
	checkAuth,
	sendOtpController,
	getAllUsers,
	getUserById,
	updateUserRole,
	deleteUser,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-otp", sendOtpController);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

// Admin routes to manage users
router.get("/users", verifyToken, getAllUsers);
router.get("/users/:userId", verifyToken, getUserById);
router.put("/users/:userId/role", verifyToken, updateUserRole);
router.delete("/users/:userId", verifyToken, deleteUser);

export default router;
