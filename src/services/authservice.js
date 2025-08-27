const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function registerUser(req, res) {
  const { email, password, firstName, lastName, phoneNumber, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [email, hashedPassword, firstName, lastName, phoneNumber, role]
    );

    const token = jwt.sign({ id: result.rows[0].id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ userId: result.rows[0].id, token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Registration failed" });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ userId: user.id, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
}

module.exports = { registerUser, loginUser };
