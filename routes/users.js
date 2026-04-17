// 1. Importing express
const express = require(`express`)

// Importing crypto-js
const cryptojs = require(`crypto-js`)

// Importing jsonwebtoken
const jwt = require(`jsonwebtoken`)

// Importing DB pool
const pool = require(`../db/pool`)

// Importing result utility
const result = require(`../utils/result`)

// Importing config (JWT secret)
const config = require(`../utils/config`)

// 2. Create router
const router = express.Router()

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body
      console.log("email and password", email, password)
    if (!email || !password) {
      return res.send(result.createResult('Email and password required'))
    }

    const users = await query(
      'SELECT email, password, role FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.send(result.createResult('Invalid credentials'))
    }

    const user = users[0]
    const hashedPassword = cryptojs.SHA256(password).toString()

    if (hashedPassword !== user.password) {
      return res.send(result.createResult('Invalid credentials'))
    }

    const token = jwt.sign(
      { email: user.email, role: user.role },
      config.SECRET,
      { expiresIn: '1h' }
    )

    res.send(
      result.createResult(null, {
        message: `${user.role} login successful`,
        role: user.role,
        token
      })
    )

  } catch (err) {
    console.error(err)
    res.send(result.createResult(err))
  }
})

module.exports = router
