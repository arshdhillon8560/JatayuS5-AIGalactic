const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.signup = async (req, res) => {
  try {
    const { email, password, full_name, phone_number } = req.body;

  
    if (!email || !password || !full_name || !phone_number) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (phone_number.length !== 10) {
      return res.status(400).json({
        message: "Invalid phone number",
      });
    }

  
    const existingUser = await db.query(
      "SELECT 1 FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }


    const hash = await bcrypt.hash(password, 10);

  
    const result = await db.query(
      `INSERT INTO users(email,password_hash,full_name,phone_number)
       VALUES($1,$2,$3,$4)
       RETURNING user_id, email, full_name, phone_number, user_type`,
      [email, hash, full_name, phone_number]
    );

    const user = result.rows[0];


    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        role: user.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user,
    });

  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

  
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

  
    const result = await db.query(
      `SELECT user_id, email, password_hash, user_type, full_name, phone_number
       FROM users WHERE email = $1`,
      [email]
    );

    if (!result.rows.length) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

  
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

  
    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        role: user.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        phone_number: user.phone_number,
        user_type: user.user_type,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};