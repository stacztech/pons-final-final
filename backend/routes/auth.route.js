import express from "express";
import {
	login,
	logout,
	signup,
	verifyEmail,
	forgotPassword,
	resetPassword,
	checkAuth,
	checkAdminAuth,
	sendOtpController,
	getAllUsers,
	getUserById,
	updateUserRole,
	deleteUser,
	debugUserRoles,
	addAdminRole,
	deleteUserByEmail,
	deleteUserById,
	getDatabaseInfo,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);
router.get("/check-admin-auth", verifyToken, checkAdminAuth);

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

// Debug route (remove in production)
router.get("/debug-roles", debugUserRoles);

// Simple endpoint to add admin role (for initial setup - remove in production)
router.post("/add-admin-role", addAdminRole);

// Temporary endpoint to delete user by email (for testing - remove in production)
router.post("/delete-user-by-email", deleteUserByEmail);

// Temporary endpoint to delete user by ID (for testing - remove in production)
router.delete("/delete-user-by-id/:userId", deleteUserById);

// Temporary endpoint to get database info (for debugging - remove in production)
router.get("/database-info", getDatabaseInfo);

export default router;
