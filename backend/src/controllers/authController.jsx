import bcrypt from 'bcryptjs';
import pool from '../config/database.jsx';
import { generateToken } from '../utils/jwt.jsx';
import { asyncHandler } from '../middleware/errorHandler.jsx';
export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    studentId,
    role,
    phone
  } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, password and role'
    });
  }
  if (!['student', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role selected'
    });
  }
  const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existingUsers.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered'
    });
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const [result] = await pool.query('INSERT INTO users (name, email, password, student_id, role, status, phone) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, email, hashedPassword, studentId || null, role, 'active', phone]);
  const [users] = await pool.query('SELECT id, name, email, student_id, role, phone FROM users WHERE id = ?', [result.insertId]);
  const user = users[0];
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user
    }
  });
});
export const login = asyncHandler(async (req, res) => {
  const {
    email,
    password
  } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }
  const [users] = await pool.query('SELECT id, name, email, password, student_id, role, status FROM users WHERE email = ?', [email]);
  if (users.length === 0) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  const user = users[0];
  if (user.status !== 'active') {
    return res.status(401).json({
      success: false,
      message: 'Account is not active'
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
  delete user.password;
  const token = generateToken(user.id);
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token
    }
  });
});
export const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});
export const getMe = asyncHandler(async (req, res) => {
  const [users] = await pool.query('SELECT id, name, email, student_id, role, status, created_at FROM users WHERE id = ?', [req.user.id]);
  res.json({
    success: true,
    data: users[0]
  });
});
