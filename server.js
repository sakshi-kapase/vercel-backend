// 1. importing
const express = require('express');
const cors = require('cors');
require("dotenv").config();

const coursesRouter = require('./routes/courses');
const adminRouter = require('./routes/admin');
const videoRouter = require('./routes/videos');
const usersRouter = require('./routes/users');     
const studentRouter = require('./routes/students'); 

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

// 4. health check route
app.get('/', (req, res) => {
  res.json({ message: 'API is running ✅' });
});

// 5. routes
app.use('/admin', adminRouter);
app.use('/courses', coursesRouter);
app.use('/videos', videoRouter);
app.use('/users', usersRouter);
app.use('/students', studentRouter);

// 6. optional error handler (good practice)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// 7. start server (IMPORTANT for Render)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});