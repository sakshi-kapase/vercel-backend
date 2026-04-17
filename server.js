// 1. importing
const express = require('express');
const cors = require('cors');
const coursesRouter = require('./routes/courses');
const adminRouter = require('./routes/admin');
const videoRouter = require('./routes/videos');
const usersRouter = require('./routes/users');     
const studentRouter = require('./routes/students'); 
require("dotenv").config();
// 2. create app
const app = express();

// 3. middleware
app.use(cors({
  origin: [
    'http://localhost:5174',
    'https://vercel-frontend-gilt-five.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());


// 4. routes
app.use('/admin', adminRouter);
app.use('/courses', coursesRouter);
app.use('/videos', videoRouter);
app.use('/users', usersRouter);
app.use('/students', studentRouter);

// 5. export (IMPORTANT for Vercel)
module.exports = app;