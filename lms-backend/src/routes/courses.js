// src/routes/courses.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/courses?search=
router.get('/', async (req, res) => {
    const { search = '' } = req.query;

    try {
        const params = [];
        let whereSql = '';

        if (search) {
            params.push(`%${search.toLowerCase()}%`);
            whereSql = `
        WHERE LOWER(c.course_name) LIKE $1
           OR CAST(c.course_id AS TEXT) LIKE $1
      `;
        }

        const query = `
      SELECT
        c.course_id AS id,              -- alias cho frontend
        c.course_name,
        c.lecture_id,
        u.name AS lecturer_name,
        c.semester,
        c.description,
        c.created_at,
        COUNT(e.id) AS student_count
      FROM course c
      LEFT JOIN users u 
        ON c.lecture_id = u.user_id
      LEFT JOIN enrollment e
        ON e.course_id = c.course_id
      ${whereSql}
      GROUP BY c.course_id, u.name, c.course_name, c.lecture_id, 
               c.semester, c.description, c.created_at
      ORDER BY c.course_id;
    `;

        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ message: 'Error fetching courses' });
    }
});

// POST /api/courses
router.post('/', async (req, res) => {
    const { course_name, lecture_id, semester, description } = req.body;

    if (!course_name) {
        return res
            .status(400)
            .json({ message: 'course_name is required' });
    }

    try {
        const query = `
      INSERT INTO course (course_name, lecture_id, semester, description, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING
        course_id AS id,
        course_name,
        lecture_id,
        semester,
        description,
        created_at;
    `;
        const values = [
            course_name,
            lecture_id || null,   // phải là user_id của giảng viên
            semester || null,
            description || null,
        ];

        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error creating course:', err);
        res.status(500).json({ message: 'Error creating course' });
    }
});

// PUT /api/courses/:id
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { course_name, lecture_id, semester, description } = req.body;

  try {
    const query = `
      UPDATE course
      SET
        course_name = COALESCE($1, course_name),
        lecture_id  = COALESCE($2, lecture_id),
        semester    = COALESCE($3, semester),
        description = COALESCE($4, description)
      WHERE course_id = $5
      RETURNING
        course_id AS id,
        course_name,
        lecture_id,
        semester,
        description,
        created_at;
    `;

    const values = [
      course_name ?? null,
      lecture_id ?? null,
      semester ?? null,
      description ?? null,
      id,
    ];

    const { rows } = await pool.query(query, values);
    if (!rows.length) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ message: 'Error updating course' });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    await pool.query('DELETE FROM course WHERE course_id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ message: 'Error deleting course' });
  }
});

module.exports = router;
