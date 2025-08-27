import 'dotenv/config';
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import authRoutes from "./api/routes/authRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Simple request logger for debugging (masks Authorization header)
// (Debug request logger removed for production readiness)

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);

// Simple JWT verification middleware for testing
function verifyToken(req, res, next) {
	const auth = req.headers.authorization || req.headers.Authorization;
	if (!auth) return res.status(401).json({ error: "No authorization header" });
	const parts = auth.split(" ");
	if (parts.length !== 2) return res.status(401).json({ error: "Invalid authorization header" });
	const token = parts[1];
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = payload;
		next();
	} catch (err) {
		return res.status(401).json({ error: "Invalid token" });
	}
}

// Protected test route
app.get('/api/protected', verifyToken, (req, res) => {
	res.json({ ok: true, user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Qwiklink backend running on port ${PORT}`));