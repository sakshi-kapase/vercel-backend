const express = require("express");
const pool = require("../db/pool");
const result = require("../utils/result");
const cryptojs = require("crypto-js");
const { authUser, authStudent } = require("../utils/auth");

const router = express.Router();

const multer = require("multer");

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}


router.post('/register-tocourse/:course_id', async (req, res) => {
  try {
    const { name, email, mobile_no } = req.body
    const { course_id } = req.params

    if (!name || !email || !course_id) {
      return res.send(result.createResult('Missing fields'))
    }

    const hashedPassword = cryptojs.SHA256('sunbeam').toString()

    const users = await query(
      'SELECT email FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      // create login user
      await query(
        'INSERT INTO users(email, password, role) VALUES (?, ?, ?)',
        [email, hashedPassword, 'Student']
      )
    }

    const exists = await query(
      'SELECT reg_no FROM students WHERE email = ? AND course_id = ?',
      [email, course_id]
    )

    if (exists.length > 0) {
      return res.send(
        result.createResult('Already enrolled in this course')
      )
    }

    await query(
      `INSERT INTO students(name, email, mobile_no, course_id)
       VALUES (?, ?, ?, ?)`,
      [name, email, mobile_no, course_id]
    )

    res.send(
      result.createResult(null, 'Course registered successfully')
    )

  } catch (err) {
    console.error(err)
    res.send(result.createResult(err))
  }
})

router.use(authUser);

router.put("/changepassword", authUser, (req, res) => {

  const email = req.user.email; // now this will work

  const { oldPassword, newPassword, confirmPassword } = req.body;
  // console.log("changepassword", email, oldPassword, newPassword, confirmPassword);

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.send(result.createResult("All password fields are required"));
  }

  if (newPassword !== confirmPassword) {
    return res.send(result.createResult("Passwords do not match"));
  }

  pool.query(
    "SELECT password FROM users WHERE email = ?",
    [email],
    (err, users) => {

      if (err)
        return res.send(result.createResult(err));

      if (users.length === 0)
        return res.send(result.createResult("User not found"));

      const hashedOld = cryptojs.SHA256(oldPassword).toString();

      if (hashedOld !== users[0].password) {
        return res.send(result.createResult("Old password is incorrect"));
      }

      const hashedNew = cryptojs.SHA256(newPassword).toString();

      pool.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedNew, email],
        (error) => {

          if (error)
            return res.send(result.createResult(error));

          res.send(
            result.createResult(null, "Password updated successfully")
          );
        }
      );
    }
  );
});



router.get("/my-courses", (req, res) => {
  pool.query(
    `SELECT c.*
     FROM courses c
     JOIN students s ON s.course_id = c.course_id
     WHERE s.email=? AND DATE(c.end_date) >= DATE(NOW())`,
    [req.user.email],
    (error, data) => {
      res.send(result.createResult(error, data));
    }
  );
});


router.get("/my-coursewith-videos", (req, res) => {
  pool.query(
    `SELECT 
        c.course_name,
        v.title,
        v.description,
        v.youtube_url
     FROM courses c
     JOIN students s ON s.course_id = c.course_id
     JOIN videos v ON v.course_id = c.course_id
     WHERE s.email=? AND DATE(c.end_date) >= DATE(NOW())`,
    [req.user.email],
    (error, data) => {
      res.send(result.createResult(error, data));
    }
  );
});

router.get("/profile", authUser, authStudent, (req, res) => {
  const email = req.user.email;

  pool.query(
    "SELECT reg_no, name, email, mobile_no, profile_pic FROM students WHERE email = ?",
    [email],
    (err, data) => {
      res.send(result.createResult(err, data[0]));
    }
  );
});

// GET VIDEOS FOR A SPECIFIC COURSE (for the logged-in student)
router.get(
  "/my-course-videos/:course_id",
  authUser,
  authStudent,
  (req, res) => {
    const { course_id } = req.params
    const email = req.user.email

    // check enrollment and if course has expired
    pool.query(
      "SELECT s.reg_no, c.end_date FROM students s JOIN courses c ON s.course_id = c.course_id WHERE s.email = ? AND s.course_id = ?",
      [email, course_id],
      (err, rows) => {
        if (err) return res.send(result.createResult(err))
        if (!rows || rows.length === 0) {
          return res.send(result.createResult('Not enrolled in this course'))
        }

        // Check if course has expired
        const endDate = new Date(rows[0].end_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        endDate.setHours(0, 0, 0, 0)

        if (endDate < today) {
          return res.send(result.createResult('Course access has expired'))
        }

        pool.query(
          "SELECT video_id, title, description, youtube_url, added_at FROM videos WHERE course_id = ? ORDER BY added_at DESC",
          [course_id],
          (error, data) => {
            res.send(result.createResult(error, data))
          }
        )
      }
    )
  }
)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.put(
  "/profile",
  authUser,
  authStudent,
  upload.single("profile_pic"),
  (req, res) => {
    const email = req.user.email;
    const { name, mobile_no } = req.body;
    const profilePic = req.file ? req.file.buffer : null;

    pool.query(
      `UPDATE students 
       SET name = ?, mobile_no = ?, profile_pic = ?
       WHERE email = ?`,
      [name, mobile_no, profilePic, email],
      (err) => {
        res.send(result.createResult(err, "Profile updated successfully"));
      }
    );
  }
);


module.exports = router;
