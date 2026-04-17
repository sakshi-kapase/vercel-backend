const express = require("express");
const jwt = require("jsonwebtoken");
const result = require("../utils/result");
const config = require("../utils/config");
const pool = require("../db/pool");
const { authUser, authAdmin } = require("../utils/auth");

const router = express.Router();


// ADMIN ONLY
router.get(
  "/enrolled-students",
  authUser,
  authAdmin,
  (req, res) => {
    const { course_id } = req.params;
    console.log("course_id", course_id);
    const sql = `
    SELECT 
      s.reg_no,
      s.name,
      s.email,
      s.mobile_no,
      c.course_name
    FROM students s
    JOIN courses c 
      ON s.course_id = c.course_id
  `;
    pool.query(sql, [course_id], (error, data) => {
      res.send(result.createResult(error, data));
    });
  }
);

router.get("/admin/profile", authUser, (req, res) => {
  const email = req.user.email;

  pool.query(
    "SELECT email, role FROM users WHERE email = ? AND role = 'Admin'",
    [email],
    (err, data) => {
      res.send(result.createResult(err, data[0]));
    }
  );
});


module.exports = router;
