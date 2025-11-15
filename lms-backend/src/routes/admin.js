const express = require("express");
const router = express.Router();
const pool = require("../db");   // <-- DÙNG PostgreSQL pool

// =============================
// ADMIN LOGIN
// =============================
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const sql = `
            SELECT 
                user_id AS id, 
                email, 
                name, 
                phone, 
                role, 
                created_at
            FROM users
            WHERE email = $1 AND password = $2 AND role = 'admin'
            LIMIT 1;
        `;
        const values = [email, password];

        const { rows } = await pool.query(sql, values);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Sai email hoặc mật khẩu" });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// =============================
// ADMIN REGISTER
// =============================
router.post("/register", async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        // 1. Check email tồn tại
        const check = await pool.query(
            "SELECT 1 FROM users WHERE email = $1 LIMIT 1",
            [email]
        );
        if (check.rows.length > 0) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        // 2. Insert admin
        const insertSql = `
            INSERT INTO users (name, email, phone, password, role, created_at)
            VALUES ($1, $2, $3, $4, 'admin', CURRENT_TIMESTAMP)
            RETURNING 
                user_id AS id,
                name,
                email,
                phone,
                role,
                created_at;
        `;
        const values = [name, email, phone, password];

        const { rows } = await pool.query(insertSql, values);

        res.json(rows[0]);
    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ message: "Không thể tạo tài khoản admin" });
    }
});

module.exports = router;
