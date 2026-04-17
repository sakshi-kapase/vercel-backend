const jwt = require("jsonwebtoken");
const config = require("./config");
const result = require("./result");

function authUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.send(result.createResult("Token is missing"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, config.SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.send(result.createResult("Invalid token"));
  }
}

function authAdmin(req, res, next) {
  if (req.user.role === "Admin") {
    next();
  } else {
    return res.send(result.createResult("Admin access required"));
  }
}

function authStudent(req, res, next) {
  if (req.user.role === "Student") {
    next();
  } else {
    return res.send(result.createResult("Student access required"));
  }
}



module.exports = {
  authUser,
  authAdmin,
  authStudent
};
