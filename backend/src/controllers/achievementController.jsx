import pool from '../config/database.jsx';
import { asyncHandler } from '../middleware/errorHandler.jsx';
const ACCEPTED_STATUS_SQL = `status IN ('accepted', 'approved')`;
const normalizeCategory = category => {
  const categoryMap = {
    academic: 'Academic',
    sports: 'Sports',
    cultural: 'Cultural',
    arts: 'Cultural',
    technical: 'Technical',
    'technical/it': 'Technical',
    leadership: 'Leadership',
    community: 'Community Service',
    'community service': 'Community Service',
    other: 'Other'
  };
  return categoryMap[String(category || '').trim().toLowerCase()] || category;
};
const getStudentSummary = async studentId => {
  const [students] = await pool.query(`SELECT
      id, name, email, student_id, department, year, phone, bio, profile_image, status
    FROM users
    WHERE id = ? AND role = 'student'`, [studentId]);
  if (students.length === 0) {
    return null;
  }
  const [achievementStats] = await pool.query(`SELECT
      COUNT(*) as total,
      SUM(CASE WHEN ${ACCEPTED_STATUS_SQL} THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN ${ACCEPTED_STATUS_SQL} THEN points ELSE 0 END) as total_points
    FROM achievements
    WHERE student_id = ?`, [studentId]);
  return {
    ...students[0],
    stats: {
      achievements: achievementStats[0]
    }
  };
};
export const getAchievements = asyncHandler(async (req, res) => {
  const {
    category,
    status,
    student_id
  } = req.query;
  let query = `
    SELECT 
      a.*,
      s.name as student_name,
      s.student_id as student_number,
      v.name as verified_by_name
    FROM achievements a
    JOIN users s ON a.student_id = s.id
    LEFT JOIN users v ON a.verified_by = v.id
    WHERE 1=1
  `;
  const params = [];
  if (req.user.role !== 'admin') {
    query += ' AND a.student_id = ?';
    params.push(req.user.id);
  } else if (student_id) {
    query += ' AND a.student_id = ?';
    params.push(student_id);
  }
  if (category) {
    query += ' AND a.category = ?';
    params.push(category);
  }
  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }
  query += ' ORDER BY a.created_at DESC';
  const [achievements] = await pool.query(query, params);
  res.json({
    success: true,
    count: achievements.length,
    data: achievements
  });
});
export const getAchievement = asyncHandler(async (req, res) => {
  const [achievements] = await pool.query(`SELECT 
      a.*,
      s.name as student_name,
      s.student_id as student_number,
      s.email as student_email,
      v.name as verified_by_name
    FROM achievements a
    JOIN users s ON a.student_id = s.id
    LEFT JOIN users v ON a.verified_by = v.id
    WHERE a.id = ?`, [req.params.id]);
  if (achievements.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found'
    });
  }
  const achievement = achievements[0];
  if (req.user.role !== 'admin' && achievement.student_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this achievement'
    });
  }
  res.json({
    success: true,
    data: achievement
  });
});
export const createAchievement = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    date
  } = req.body;
  if (!title || !description || !category || !date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  const evidence_url = req.file ? `/uploads/${req.file.filename}` : req.body.evidence_url || null;
  const normalizedCategory = normalizeCategory(category);
  const [result] = await pool.query(`INSERT INTO achievements (student_id, title, description, category, date, evidence_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [req.user.id, title, description, normalizedCategory, date, evidence_url, 'pending']);
  const [achievements] = await pool.query('SELECT * FROM achievements WHERE id = ?', [result.insertId]);
  await pool.query(`INSERT INTO notifications (user_id, title, message, type)
     SELECT id, ?, ?, ?
     FROM users WHERE role = 'admin'`, ['New Achievement Submitted', `${req.user.name} submitted a new achievement: ${title}`, 'achievement']);
  res.status(201).json({
    success: true,
    message: 'Achievement submitted successfully',
    data: achievements[0]
  });
});
export const updateAchievement = asyncHandler(async (req, res) => {
  const [achievements] = await pool.query('SELECT * FROM achievements WHERE id = ?', [req.params.id]);
  if (achievements.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found'
    });
  }
  const achievement = achievements[0];
  if (req.user.role !== 'admin' && achievement.student_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this achievement'
    });
  }
  if (req.user.role !== 'admin' && achievement.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Can only update pending achievements'
    });
  }
  const {
    title,
    description,
    category,
    date
  } = req.body;
  const evidence_url = req.file ? `/uploads/${req.file.filename}` : req.body.evidence_url || achievement.evidence_url;
  const normalizedCategory = normalizeCategory(category);
  await pool.query(`UPDATE achievements 
     SET title = ?, description = ?, category = ?, date = ?, evidence_url = ?
     WHERE id = ?`, [title, description, normalizedCategory, date, evidence_url, req.params.id]);
  const [updatedAchievements] = await pool.query('SELECT * FROM achievements WHERE id = ?', [req.params.id]);
  res.json({
    success: true,
    message: 'Achievement updated successfully',
    data: updatedAchievements[0]
  });
});
export const deleteAchievement = asyncHandler(async (req, res) => {
  const [achievements] = await pool.query('SELECT * FROM achievements WHERE id = ?', [req.params.id]);
  if (achievements.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found'
    });
  }
  const achievement = achievements[0];
  if (req.user.role !== 'admin' && achievement.student_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this achievement'
    });
  }
  await pool.query('DELETE FROM achievements WHERE id = ?', [req.params.id]);
  res.json({
    success: true,
    message: 'Achievement deleted successfully'
  });
});
export const verifyAchievement = asyncHandler(async (req, res) => {
  const {
    status,
    points,
    rejection_reason
  } = req.body;
  if (!status || !['accepted', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be "accepted" or "rejected"'
    });
  }
  const [achievements] = await pool.query('SELECT * FROM achievements WHERE id = ?', [req.params.id]);
  if (achievements.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Achievement not found'
    });
  }
  const achievement = achievements[0];
  if (achievement.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending achievements can be verified'
    });
  }
  const normalizedStatus = status === 'accepted' ? 'approved' : status;
  await pool.query(`UPDATE achievements 
     SET status = ?, points = ?, verified_by = ?, verified_at = NOW(), rejection_reason = ?
     WHERE id = ?`, [normalizedStatus, points || 0, req.user.id, rejection_reason || null, req.params.id]);
  const notificationMessage = normalizedStatus === 'approved' ? `Your achievement "${achievement.title}" has been approved!` : `Your achievement "${achievement.title}" was rejected. ${rejection_reason || ''}`;
  await pool.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', [achievement.student_id, 'Achievement Verification', notificationMessage, 'achievement']);
  const [updatedAchievements] = await pool.query('SELECT * FROM achievements WHERE id = ?', [req.params.id]);
  const updatedStudent = await getStudentSummary(achievement.student_id);
  res.json({
    success: true,
    message: `Achievement ${normalizedStatus}`,
    data: {
      achievement: updatedAchievements[0],
      student: updatedStudent
    }
  });
});
