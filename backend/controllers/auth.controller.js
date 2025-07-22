import bcryptjs from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	// sendWelcomeEmail,
} from "../mailtrap/emails.js";
import { User } from "../models/user.model.js";

export const signup = async (req, res) => {
	// Debug: log incoming data
	console.log('Signup request body:', req.body);
	const { email, password, name, phone } = req.body;

	try {
		// Validate required fields
		if (!name || typeof name !== 'string' || name.length < 3) {
			return res.status(400).json({ success: false, message: 'Name is required and must be at least 3 characters.' });
		}
		if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
			return res.status(400).json({ success: false, message: 'A valid email is required.' });
		}
		if (!password || typeof password !== 'string' || password.length < 6) {
			return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
		}
		if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone)) {
			return res.status(400).json({ success: false, message: 'A valid 10-digit phone number is required.' });
		}

		let user = await User.findOne({ email });
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
		const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
		let hashedPassword;
		try {
			hashedPassword = await bcryptjs.hash(password, 10);
		} catch (hashErr) {
			console.error('Error hashing password:', hashErr);
			return res.status(500).json({ success: false, message: 'Server error hashing password.' });
		}

		if (user) {
			if (user.isVerified) {
				return res.status(400).json({ success: false, message: 'User already exists and is verified. Please login.' });
			}
			// Always override details, mark as verified, and resend OTP
			user.name = name;
			user.password = hashedPassword;
			user.phone = phone;
			user.verificationToken = verificationToken;
			user.verificationTokenExpiresAt = verificationTokenExpiresAt;
			user.isVerified = true;
			await user.save();
			await sendVerificationEmail(user.email, verificationToken);
			return 			res.status(200).json({
				success: true,
				message: 'Account details updated. User is now verified. OTP sent to your email.',
				user: {
					_id: user._id,
					email: user.email,
					name: user.name,
					phone: user.phone,
					role: user.role,
					lastLogin: user.lastLogin,
					isVerified: user.isVerified,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt
				},
			});
		}

		// New user
		user = new User({
			email,
			password: hashedPassword,
			name,
			phone,
			role: 'user', // Set all new users as user
			isVerified: true,
			verificationToken,
			verificationTokenExpiresAt,
		});
		await user.save();
		await sendVerificationEmail(user.email, verificationToken);
		res.status(201).json({
			success: true,
			message: 'User created successfully and is now verified. OTP sent to your email.',
			user: {
				_id: user._id,
				email: user.email,
				name: user.name,
				phone: user.phone,
				role: user.role,
				lastLogin: user.lastLogin,
				isVerified: user.isVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			},
		});
	} catch (error) {
		console.error('Signup error:', error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		// Do NOT set isVerified to true here
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		res.status(200).json({
			success: true,
			message: "OTP verified successfully, but user is not marked as verified.",
			user: {
				_id: user._id,
				email: user.email,
				name: user.name,
				phone: user.phone,
				role: user.role,
				lastLogin: user.lastLogin,
				isVerified: user.isVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		generateTokenAndSetCookie(res, user._id);

		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			user: {
				_id: user._id,
				email: user.email,
				name: user.name,
				phone: user.phone,
				role: user.role,
				lastLogin: user.lastLogin,
				isVerified: user.isVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
	res.clearCookie("token");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendResetSuccessEmail(user.email);

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		console.log('=== checkAuth called ===');
		console.log('Requesting userId:', req.userId);
		console.log('Request timestamp:', new Date().toISOString());
		
		const user = await User.findById(req.userId).select("-password");
		console.log('User found in checkAuth:', user ? {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role
		} : 'null');
		
		if (!user) {
			console.log('❌ User not found in database - user may be deleted');
			return res.status(401).json({ 
				success: false, 
				message: "User not found - account may have been deleted",
				userDeleted: true
			});
		}

		console.log('✅ User authenticated:', user.email);
		res.status(200).json({ 
			success: true, 
			user: {
				_id: user._id,
				email: user.email,
				name: user.name,
				phone: user.phone,
				role: user.role,
				lastLogin: user.lastLogin,
				isVerified: user.isVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			}
		});
	} catch (error) {
		console.log("❌ Error in checkAuth:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

export const checkAdminAuth = async (req, res) => {
	try {
		console.log('=== checkAdminAuth called ===');
		console.log('Requesting userId:', req.userId);
		console.log('Request timestamp:', new Date().toISOString());
		
		const user = await User.findById(req.userId).select("-password");
		console.log('User found from database:', user ? {
			id: user._id,
			email: user.email,
			name: user.name,
			role: user.role,
			roleType: typeof user.role
		} : 'null');
		
		if (!user) {
			console.log('❌ User not found in database');
			return res.status(401).json({ success: false, message: "User not found" });
		}

		// More robust role checking
		const userRole = user.role || user._doc?.role;
		console.log('🔍 Role validation:');
		console.log('  - User role from DB:', userRole);
		console.log('  - Role type:', typeof userRole);
		console.log('  - Is admin?', userRole === 'admin');
		console.log('  - Raw user object:', JSON.stringify(user._doc || user, null, 2));
		
		if (userRole !== 'admin') {
			console.log('❌ Access denied - user role is not admin');
			return res.status(403).json({ 
				success: false, 
				message: "Access denied. Admin privileges required.",
				isAdmin: false,
				userRole: userRole,
				userData: {
					id: user._id,
					email: user.email,
					name: user.name,
					role: userRole
				}
			});
		}

		console.log('✅ Admin access granted for user:', user.email);
		res.status(200).json({ 
			success: true, 
			user: {
				_id: user._id,
				email: user.email,
				name: user.name,
				phone: user.phone,
				role: user.role,
				lastLogin: user.lastLogin,
				isVerified: user.isVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			},
			isAdmin: true
		});
	} catch (error) {
		console.log("❌ Error in checkAdminAuth:", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

export const sendOtpController = async (req, res) => {
  const { email, name, password, phone } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    let user = await User.findOne({ email });
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    let hashedPassword = password ? await bcryptjs.hash(password, 10) : undefined;
    if (!user) {
      // Save all provided details and OTP, mark as unverified
      user = new User({
        email,
        name,
        phone,
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        verificationTokenExpiresAt,
      });
      await user.save();
      await sendVerificationEmail(email, verificationToken);
      return res.status(200).json({ success: true, message: "OTP sent to your email" });
    } else {
      // Always update details if provided
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (password) user.password = hashedPassword;
      user.verificationToken = verificationToken;
      user.verificationTokenExpiresAt = verificationTokenExpiresAt;
      user.isVerified = false;
      await user.save();
      await sendVerificationEmail(user.email, verificationToken);
      return res.status(200).json({ success: true, message: "OTP sent to your email" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
	try {
		// Check if the requesting user is an admin
		const requestingUser = await User.findById(req.userId);
		console.log('Requesting user:', requestingUser);
		
		if (!requestingUser || requestingUser.role !== 'admin') {
			console.log('Access denied - requesting user role:', requestingUser?.role);
			return res.status(403).json({ 
				success: false, 
				message: "Access denied. Admin privileges required." 
			});
		}

		// Get all users excluding password field
		const users = await User.find({}).select('-password').sort({ createdAt: -1 });
		console.log('All users found:', users.map(u => ({ id: u._id, email: u.email, role: u.role })));

		res.status(200).json({
			success: true,
			users: users,
			count: users.length
		});
	} catch (error) {
		console.log("Error in getAllUsers ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const getUserById = async (req, res) => {
	try {
		// Check if the requesting user is an admin
		const requestingUser = await User.findById(req.userId);
		if (!requestingUser || requestingUser.role !== 'admin') {
			return res.status(403).json({ 
				success: false, 
				message: "Access denied. Admin privileges required." 
			});
		}

		const { userId } = req.params;
		
		// Validate userId format
		if (!userId || userId.length !== 24) {
			return res.status(400).json({ 
				success: false, 
				message: "Invalid user ID format" 
			});
		}

		// Get user by ID excluding password field
		const user = await User.findById(userId).select('-password');

		if (!user) {
			return res.status(404).json({ 
				success: false, 
				message: "User not found" 
			});
		}

		res.status(200).json({
			success: true,
			user: user
		});
	} catch (error) {
		console.log("Error in getUserById ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const updateUserRole = async (req, res) => {
	try {
		// Check if the requesting user is an admin
		const requestingUser = await User.findById(req.userId);
		if (!requestingUser || requestingUser.role !== 'admin') {
			return res.status(403).json({ 
				success: false, 
				message: "Access denied. Admin privileges required." 
			});
		}

		const { userId } = req.params;
		const { role } = req.body;

		// Validate role
		if (!role || !['user', 'admin'].includes(role)) {
			return res.status(400).json({ 
				success: false, 
				message: "Invalid role. Must be 'user' or 'admin'" 
			});
		}

		// Validate userId format
		if (!userId || userId.length !== 24) {
			return res.status(400).json({ 
				success: false, 
				message: "Invalid user ID format" 
			});
		}

		// Prevent admin from changing their own role
		if (userId === req.userId) {
			return res.status(400).json({ 
				success: false, 
				message: "Cannot change your own role" 
			});
		}

		// Update user role
		const updatedUser = await User.findByIdAndUpdate(
			userId, 
			{ role }, 
			{ new: true }
		).select('-password');

		if (!updatedUser) {
			return res.status(404).json({ 
				success: false, 
				message: "User not found" 
			});
		}

		res.status(200).json({
			success: true,
			message: "User role updated successfully",
			user: updatedUser
		});
	} catch (error) {
		console.log("Error in updateUserRole ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const deleteUser = async (req, res) => {
	try {
		// Check if the requesting user is an admin
		const requestingUser = await User.findById(req.userId);
		if (!requestingUser || requestingUser.role !== 'admin') {
			return res.status(403).json({ 
				success: false, 
				message: "Access denied. Admin privileges required." 
			});
		}

		const { userId } = req.params;

		// Validate userId format
		if (!userId || userId.length !== 24) {
			return res.status(400).json({ 
				success: false, 
				message: "Invalid user ID format" 
			});
		}

		// Prevent admin from deleting themselves
		if (userId === req.userId) {
			return res.status(400).json({ 
				success: false, 
				message: "Cannot delete your own account" 
			});
		}

		// Check if user exists
		const userToDelete = await User.findById(userId);
		if (!userToDelete) {
			return res.status(404).json({ 
				success: false, 
				message: "User not found" 
			});
		}

		// Delete user
		await User.findByIdAndDelete(userId);

		res.status(200).json({
			success: true,
			message: "User deleted successfully"
		});
	} catch (error) {
		console.log("Error in deleteUser ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Temporary endpoint to check and fix user roles (remove in production)
export const debugUserRoles = async (req, res) => {
	try {
		console.log('=== DEBUG USER ROLES ===');
		
		// Get all users
		const users = await User.find({}).select('-password');
		console.log('All users in database:');
		users.forEach(user => {
			console.log(`- ID: ${user._id}, Email: ${user.email}, Role: ${user.role}, Type: ${typeof user.role}`);
			console.log(`  Raw user object:`, JSON.stringify(user._doc || user, null, 2));
		});

		// Check if any users have admin role
		const adminUsers = users.filter(user => user.role === 'admin');
		console.log(`Admin users found: ${adminUsers.length}`);
		adminUsers.forEach(user => {
			console.log(`- Admin: ${user.email} (${user._id})`);
		});

		// Check for users with undefined/null roles
		const usersWithoutRole = users.filter(user => !user.role);
		console.log(`Users without role: ${usersWithoutRole.length}`);
		usersWithoutRole.forEach(user => {
			console.log(`- No role: ${user.email} (${user._id})`);
		});

		// If no admin users, create one (for testing)
		if (adminUsers.length === 0) {
			console.log('No admin users found. Creating one for testing...');
			const firstUser = users[0];
			if (firstUser) {
				firstUser.role = 'admin';
				await firstUser.save();
				console.log(`Made ${firstUser.email} an admin`);
			}
		}

		res.status(200).json({
			success: true,
			message: "User roles debugged",
			users: users.map(u => ({ 
				id: u._id, 
				email: u.email, 
				role: u.role,
				roleType: typeof u.role,
				hasRole: !!u.role
			})),
			adminCount: adminUsers.length,
			usersWithoutRole: usersWithoutRole.length
		});
	} catch (error) {
		console.log("Error in debugUserRoles ", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// Simple endpoint to add admin role to a user by email (for initial setup)
export const addAdminRole = async (req, res) => {
	try {
		const { email } = req.body;
		
		if (!email) {
			return res.status(400).json({ 
				success: false, 
				message: "Email is required" 
			});
		}

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ 
				success: false, 
				message: "User not found with this email" 
			});
		}

		// Update user role to admin
		user.role = 'admin';
		await user.save();

		console.log(`Made ${user.email} an admin`);

		res.status(200).json({
			success: true,
			message: "User role updated to admin",
			user: {
				_id: user._id,
				email: user.email,
				name: user.name,
				role: user.role
			}
		});
	} catch (error) {
		console.log("Error in addAdminRole ", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// Temporary endpoint to delete a specific user by email (for testing)
export const deleteUserByEmail = async (req, res) => {
	try {
		const { email } = req.body;
		
		if (!email) {
			return res.status(400).json({ 
				success: false, 
				message: "Email is required" 
			});
		}

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ 
				success: false, 
				message: "User not found with this email" 
			});
		}

		// Delete user
		await User.findByIdAndDelete(user._id);

		console.log(`Deleted user: ${user.email} (${user._id})`);

		res.status(200).json({
			success: true,
			message: "User deleted successfully",
			deletedUser: {
				_id: user._id,
				email: user.email,
				name: user.name
			}
		});
	} catch (error) {
		console.log("Error in deleteUserByEmail ", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// Temporary endpoint to delete a specific user by ID (for testing)
export const deleteUserById = async (req, res) => {
	try {
		const { userId } = req.params;
		
		if (!userId) {
			return res.status(400).json({ 
				success: false, 
				message: "User ID is required" 
			});
		}

		// Find user by ID
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ 
				success: false, 
				message: "User not found with this ID" 
			});
		}

		// Delete user
		await User.findByIdAndDelete(userId);

		console.log(`Deleted user by ID: ${user.email || 'No email'} (${user._id})`);

		res.status(200).json({
			success: true,
			message: "User deleted successfully",
			deletedUser: {
				_id: user._id,
				email: user.email,
				name: user.name
			}
		});
	} catch (error) {
		console.log("Error in deleteUserById ", error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// Temporary endpoint to show database connection info
export const getDatabaseInfo = async (req, res) => {
	try {
		const dbInfo = {
			connectionString: process.env.MONGO_URI ? 'Set (hidden for security)' : 'Not set',
			databaseName: User.db.name,
			collectionName: User.collection.name,
			totalUsers: await User.countDocuments(),
			connectionState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
			host: mongoose.connection.host || 'Unknown',
			port: mongoose.connection.port || 'Unknown',
			database: mongoose.connection.name || 'Unknown'
		};

		res.status(200).json({
			success: true,
			message: "Database connection information",
			databaseInfo: dbInfo
		});
	} catch (error) {
		console.log("Error in getDatabaseInfo ", error);
		res.status(500).json({ success: false, message: error.message });
	}
};


