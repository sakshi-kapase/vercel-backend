const express = require("express");
const pool = require("../db/pool");
const result = require("../utils/result");
const { authUser, authAdmin } = require("../utils/auth");

const router = express.Router();

// ADMIN ONLY
router.use(authUser, authAdmin);

// GET VIDEOS
router.get("/all-videos", (req, res) => {
  const { course_id } = req.params;
  pool.query(
    "SELECT * FROM videos",
    [course_id],
    (error, data) => {
      res.send(result.createResult(error, data));
    }
  );
});

// ADD VIDEO
router.post("/add", (req, res) => {
  const { course_id, title, description, youtube_url } = req.body;

  pool.query(
    "INSERT INTO videos(course_id,title,description,youtube_url) VALUES (?,?,?,?)",
    [course_id, title, description, youtube_url],
    (error, data) => {
      res.send(result.createResult(error, data));
    }
  );
});

// UPDATE VIDEO
router.put("/update/:video_id", (req, res) => {
  const { video_id } = req.params;
  const { course_id, title, description, youtube_url } = req.body;

  pool.query(
    `UPDATE videos SET course_id=?, title=?, description=?, youtube_url=? WHERE video_id=?`,
    [course_id, title, description, youtube_url, video_id],
    (error, data) => {
      res.send(result.createResult(error, data));
    }
  );
});

// DELETE VIDEO
router.delete("/delete/:video_id", (req, res) => {
  const { video_id } = req.params;
  console.log("Deleting video with ID:", video_id);
  pool.query(
    "DELETE FROM videos WHERE video_id=?",
    [video_id],
    (error, data) => {
      res.send(result.createResult(error, data));
    }
  );
});

module.exports = router;
