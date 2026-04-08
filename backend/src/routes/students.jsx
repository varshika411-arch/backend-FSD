import express from 'express';
import { getStudents, getStudent, updateStudent, deleteStudent } from '../controllers/studentController.jsx';
import { protect, authorize } from '../middleware/auth.jsx';
import pool from '../config/database.jsx';
import { asyncHandler } from '../middleware/errorHandler.jsx';

const router = express.Router();

// ── Notifications (must be before /:id) ──────────────────────────────────────
router.get('/notifications', protect, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json({ success: true, data: rows });
}));

router.put('/notifications/read-all', protect, asyncHandler(async (req, res) => {
  await pool.query(
    "UPDATE notifications SET `read` = 1 WHERE user_id = ?",
    [req.user.id]
  );
  res.json({ success: true, message: 'All notifications marked as read' });
}));

router.put('/notifications/:nid/read', protect, asyncHandler(async (req, res) => {
  await pool.query(
    "UPDATE notifications SET `read` = 1 WHERE id = ? AND user_id = ?",
    [req.params.nid, req.user.id]
  );
  res.json({ success: true, message: 'Notification marked as read' });
}));

router.delete('/notifications/:nid', protect, asyncHandler(async (req, res) => {
  await pool.query(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [req.params.nid, req.user.id]
  );
  res.json({ success: true, message: 'Notification deleted' });
}));

// ── Portfolio (must be before /:id) ──────────────────────────────────────────
router.get('/portfolio', protect, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT * FROM portfolio WHERE student_id = ? ORDER BY date DESC',
    [req.user.id]
  );
  res.json({ success: true, data: rows });
}));

router.post('/portfolio', protect, asyncHandler(async (req, res) => {
  const { title, description, category, link, date } = req.body;
  if (!title || !category || !date) {
    return res.status(400).json({ success: false, message: 'Title, category and date are required' });
  }
  const [result] = await pool.query(
    'INSERT INTO portfolio (student_id, title, description, category, link, date) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.id, title, description || '', category, link || '', date]
  );
  const [rows] = await pool.query('SELECT * FROM portfolio WHERE id = ?', [result.insertId]);
  res.status(201).json({ success: true, data: rows[0] });
}));

router.put('/portfolio/:pid', protect, asyncHandler(async (req, res) => {
  const { title, description, category, link, date } = req.body;
  await pool.query(
    'UPDATE portfolio SET title = ?, description = ?, category = ?, link = ?, date = ? WHERE id = ? AND student_id = ?',
    [title, description || '', category, link || '', date, req.params.pid, req.user.id]
  );
  const [rows] = await pool.query('SELECT * FROM portfolio WHERE id = ?', [req.params.pid]);
  res.json({ success: true, data: rows[0] });
}));

router.delete('/portfolio/:pid', protect, asyncHandler(async (req, res) => {
  await pool.query(
    'DELETE FROM portfolio WHERE id = ? AND student_id = ?',
    [req.params.pid, req.user.id]
  );
  res.json({ success: true, message: 'Portfolio item deleted' });
}));

// ── Students CRUD ─────────────────────────────────────────────────────────────
router.get('/', protect, authorize('admin'), getStudents);
router.get('/:id', protect, getStudent);
router.put('/:id', protect, updateStudent);
router.delete('/:id', protect, authorize('admin'), deleteStudent);

export default router;
