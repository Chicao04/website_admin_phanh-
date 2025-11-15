// src/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Route test
app.get('/', (req, res) => {
    res.send('LMS backend is running 🚀');
});

// API chính
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
