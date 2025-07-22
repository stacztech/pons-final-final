import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
	console.log('verifyToken called');
	console.log('Cookies:', req.cookies);
	const token = req.cookies.token;
	console.log('Token:', token);
	if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });

		req.userId = decoded.userId;

		// --- Sliding expiration: refresh cookie on every request ---
		res.cookie("token", token, {
			httpOnly: true,
			secure: false, // for localhost
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});
		console.log('Sliding expiration: cookie refreshed');

		next();
	} catch (error) {
		console.log("Error in verifyToken ", error);
		return res.status(500).json({ success: false, message: "Server error" });
	}
};
