// src/routes/users.js
const express = require('express');
const crypto = require('crypto');              // <- thêm
const router = express.Router();
const pool = require('../db');

// hàm hash MD5 dùng chung
function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

// GET /api/users?search=&role=
router.get('/', async (req, res) => {
    const { search = '', role } = req.query;

    try {
        const params = [];
        const whereClauses = [];

        if (search) {
            params.push(`%${search.toLowerCase()}%`);
            const idx = params.length;
            whereClauses.push(
                `(LOWER(name) LIKE $${idx} OR LOWER(email) LIKE $${idx})`
            );
        }

        if (role && role !== 'all') {
            params.push(role);
            const idx = params.length;
            whereClauses.push(`role = $${idx}`);
        }

        const whereSql = whereClauses.length
            ? 'WHERE ' + whereClauses.join(' AND ')
            : '';

        const query = `
      SELECT 
        user_id AS id,  -- alias cho frontend
        email,
        name,
        phone,
        role,
        avatar_url,
        created_at
      FROM users
      ${whereSql}
      ORDER BY user_id;
    `;

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// POST /api/users
router.post('/', async (req, res) => {
    const { name, email, phone, role, password, avatar_url } = req.body;

    if (!name || !email || !password) {
        return res
            .status(400)
            .json({ message: 'name, email và password là bắt buộc' });
    }

    try {
        const hashedPassword = md5(password);   // hash mật khẩu

        const query = `
      INSERT INTO users (name, email, phone, role, password, avatar_url, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING 
        user_id AS id,
        email,
        name,
        phone,
        role,
        avatar_url,
        created_at;
    `;
        const values = [
            name,
            email,
            phone || null,
            role || 'student',
            hashedPassword,
            avatar_url || null,
        ];

        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// PUT /api/users/:id  (cho phép đổi mật khẩu nếu gửi kèm)
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { name, email, phone, role, avatar_url, password } = req.body;

    try {
        const query = `
      UPDATE users
      SET
        name       = COALESCE($1, name),
        email      = COALESCE($2, email),
        phone      = COALESCE($3, phone),
        role       = COALESCE($4, role),
        avatar_url = COALESCE($5, avatar_url),
        password   = COALESCE($6, password)
      WHERE user_id = $7
      RETURNING 
        user_id AS id,
        email,
        name,
        phone,
        role,
        avatar_url,
        created_at;
    `;

        const hashedPassword = password ? md5(password) : null;

        const values = [
            name ?? null,
            email ?? null,
            phone ?? null,
            role ?? null,
            avatar_url ?? null,
            hashedPassword,
            id,
        ];

        const { rows } = await pool.query(query, values);
        if (!rows.length) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Error updating user' });
    }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);

    try {
        await pool.query('DELETE FROM users WHERE user_id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router;
