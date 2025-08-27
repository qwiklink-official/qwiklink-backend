import pool from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const makeToken = (user) =>
  jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

export async function register(req, res) {
  try {
    const { email, password, firstName, lastName, phoneNumber, role } = req.body;

    if (!email || !password || !firstName || !lastName || !phoneNumber || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!["customer", "driver"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const passwordHash = await bcrypt.hash(password, 10);

    const insertSql = `
      insert into public.users (id, full_name, email, phone, role, password_hash)
      values (gen_random_uuid(), $1, $2, $3, $4, $5)
      returning id, role
    `;
    const { rows } = await pool.query(insertSql, [
      fullName, email, phoneNumber, role, passwordHash
    ]);
    const user = rows[0];

    const token = makeToken(user);
    return res.status(201).json({ userId: user.id, token });
  } catch (err) {
    // unique violation = 23505
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email or phone already in use" });
    }
    console.error("REGISTER_ERR", err);
    return res.status(500).json({ error: "Registration failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    const { rows } = await pool.query(
      "select id, role, password_hash from public.users where email = $1 limit 1",
      [email]
    );
    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = makeToken(user);
    return res.status(200).json({ userId: user.id, token });
  } catch (err) {
    console.error("LOGIN_ERR", err);
        return res.status(500).json({ error: "Login failed" });
      }
    }