// 1. importing
const express = require('express');
const cors = require('cors');
const coursesRouter = require('./routes/courses');
const adminRouter = require('./routes/admin');
const videoRouter = require('./routes/videos');
const usersRouter = require('./routes/users');     
const studentRouter = require('./routes/students'); 

// 2. create app
const app = express();

// 3. middleware
app.use(cors({
  origin: 'http://localhost:5174',
  credentials: true
}));
app.use(express.json());

// app.use(authUser);

// 4. routes
app.use('/admin', adminRouter);      // login is PUBLIC
app.use('/courses', coursesRouter);  // protected inside route
app.use('/videos', videoRouter);     // protected inside route
app.use('/users', usersRouter);        // signup / signin
app.use('/students', studentRouter);  // protected inside route

// 5. run app
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
