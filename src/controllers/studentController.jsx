import pool from '../config/database.jsx';
import { asyncHandler } from '../middleware/errorHandler.jsx';
const ACCEPTED_STATUS_SQL = `status IN ('accepted', 'approved')`;
export const getStudents = asyncHandler(async (req, res) => {
  const {
    department,
    year,
    status
  } = req.query;
  let query = 'SELECT id, name, email, student_id, department, year, phone, status, created_at FROM users WHERE role = ?';
  const params = ['student'];
  if (department) {
    query += ' AND department = ?';
    params.push(department);
  }
  if (year) {
    query += ' AND year = ?';
    params.push(year);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  query += ' ORDER BY name ASC';
  const [students] = await pool.query(query, params);
  for (let student of students) {
    const [counts] = await pool.query(`SELECT COUNT(*) as total, SUM(CASE WHEN ${ACCEPTED_STATUS_SQL} THEN 1 ELSE 0 END) as approved FROM achievements WHERE student_id = ?`, [student.id]);
    student.achievementCount = counts[0].total;
    student.approvedAchievements = counts[0].approved;
  }
  res.json({
    success: true,
    count: students.length,
    data: students
  });
});
export const getStudent = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this profile'
    });
  }
  const [students] = await pool.query('SELECT id, name, email, student_id, department, year, phone, bio, profile_image, status, created_at FROM users WHERE id = ? AND role = ?', [req.params.id, 'student']);
  if (students.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }
  const student = students[0];
  const [achievementStats] = await pool.query(`SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN ${ACCEPTED_STATUS_SQL} THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN ${ACCEPTED_STATUS_SQL} THEN points ELSE 0 END) as total_points
    FROM achievements WHERE student_id = ?`, [req.params.id]);
  const [eventStats] = await pool.query('SELECT COUNT(*) as total FROM event_registrations WHERE student_id = ? AND status = "registered"', [req.params.id]);
  student.stats = {
    achievements: achievementStats[0],
    events: eventStats[0].total
  };
  res.json({
    success: true,
    data: student
  });
});
export const updateStudent = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this profile'
    });
  }
  const {
    name,
    phone,
    department,
    year,
    bio
  } = req.body;
  const [students] = await pool.query('SELECT * FROM users WHERE id = ? AND role = ?', [req.params.id, 'student']);
  if (students.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }
  await pool.query('UPDATE users SET name = ?, phone = ?, department = ?, year = ?, bio = ? WHERE id = ?', [name, phone, department, year, bio, req.params.id]);
  const [updatedStudents] = await pool.query('SELECT id, name, email, student_id, department, year, phone, bio, profile_image, status FROM users WHERE id = ?', [req.params.id]);
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedStudents[0]
  });
});
export const deleteStudent = asyncHandler(async (req, res) => {
  const [students] = await pool.query('SELECT * FROM users WHERE id = ? AND role = ?', [req.params.id, 'student']);
  if (students.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({
    success: true,
    message: 'Student deleted successfully'
  });
});
