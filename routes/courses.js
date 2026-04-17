const express = require("express");
const pool = require("../db/pool");
const result = require("../utils/result");
const { authUser, authAdmin } = require("../utils/auth");

const router = express.Router();

// ADMIN – GET ALL COURSES
router.get("/all-courses", authUser, authAdmin, (req, res) => {
  const sql = `
    SELECT
      c.course_id,
      c.course_name,
      c.description,
      c.fees,
      c.start_date,
      c.end_date,
      c.video_expire_days,
      COUNT(s.reg_no) AS student_count
    FROM courses c
    LEFT JOIN students s
      ON c.course_id = s.course_id
    GROUP BY c.course_id
  `;

  pool.query(sql, (error, data) => {
    res.send(result.createResult(error, data));
  });
});


// ADMIN – ADD COURSE
router.post("/add", authUser, authAdmin, (req, res) => {
  const { course_name, description, fees, start_date, end_date, video_expire_days } = req.body;

  if (!course_name || !fees || !start_date || !end_date) {
    return res.send(result.createResult("Required fields missing", null));
  }

  const sql = `
    INSERT INTO courses 
    (course_name, description, fees, start_date, end_date, video_expire_days)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  pool.query(
    sql,
    [course_name, description, fees, start_date, end_date, video_expire_days],
    (error, data) => {
      res.send(
        error
          ? result.createResult("Database error", null)
          : result.createResult(null, { courseId: data.insertId })
      );
    }
  );
});

// ADMIN – UPDATE COURSE
router.put("/update/:course_id", authUser, authAdmin, (req, res) => {
  const { course_id } = req.params;
  const { course_name, description, fees, start_date, end_date, video_expire_days } = req.body;

  const sql = `
    UPDATE courses 
    SET course_name=?, description=?, fees=?, start_date=?, end_date=?, video_expire_days=?
    WHERE course_id=?
  `;

  pool.query(
    sql,
    [course_name, description, fees, start_date, end_date, video_expire_days, course_id],
    (error, data) => {
      if (error) return res.send(result.createResult("Database error", null));
      if (data.affectedRows === 0)
        return res.send(result.createResult("Course not found", null));

      res.send(result.createResult(null, "Course updated successfully"));
    }
  );
});

// ADMIN – DELETE COURSE
router.delete("/delete/:course_id", authUser, authAdmin, (req, res) => {
  const { course_id } = req.params;

  pool.query(
    "DELETE FROM courses WHERE course_id=?",
    [course_id],
    (error, data) => {
      if (error) return res.send(result.createResult("Database error", null));
      if (data.affectedRows === 0)
        return res.send(result.createResult("Course not found", null));

      res.send(result.createResult(null, "Course deleted successfully"));
    }
  );
});

// PUBLIC – ACTIVE COURSES
// PUBLIC – COURSES NOT YET EXPIRED
router.get("/all-active-courses", (req, res) => {
  const sql = `
    SELECT
      course_id,
      course_name,
      description,
      fees,
      start_date,
      end_date,
      video_expire_days
    FROM courses
    WHERE DATE(end_date) >= DATE(NOW())
  `;

  pool.query(sql, (error, data) => {
    if (error) {
      return res.send(result.createResult(error));
    }
    res.send(result.createResult(null, data));
  });
});

// PUBLIC – GET COURSE BY ID (for registration page)
router.get("/:course_id", (req, res) => {
  const { course_id } = req.params;

  const sql = `
    SELECT course_id, course_name
    FROM courses
    WHERE course_id = ?
  `;

  pool.query(sql, [course_id], (error, data) => {
    if (error) {
      return res.send(result.createResult(error));
    }

    if (data.length === 0) {
      return res.send(result.createResult("Course not found"));
    }

    res.send(result.createResult(null, data[0]));
  });
});



module.exports = router;
