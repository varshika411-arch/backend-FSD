import pool from '../config/database.jsx';
import { asyncHandler } from '../middleware/errorHandler.jsx';
const ACCEPTED_STATUS_SQL = `status IN ('accepted', 'approved')`;
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [studentCount] = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'student'");
  const [achievementStats] = await pool.query(`SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN ${ACCEPTED_STATUS_SQL} THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM achievements`);
  const [eventStats] = await pool.query(`SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN date >= CURDATE() THEN 1 ELSE 0 END) as upcoming,
      SUM(CASE WHEN date < CURDATE() THEN 1 ELSE 0 END) as past
    FROM events`);
  const [registrationCount] = await pool.query("SELECT COUNT(*) as total FROM event_registrations WHERE status = 'registered'");
  const [recentAchievements] = await pool.query(`SELECT 
      a.id, a.title, a.status, a.created_at,
      u.name as student_name
    FROM achievements a
    JOIN users u ON a.student_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 5`);
  const [upcomingEvents] = await pool.query(`SELECT 
      e.id, e.title, e.date, e.time,
      COUNT(er.id) as registered_count
    FROM events e
    LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'registered'
    WHERE e.date >= CURDATE()
    GROUP BY e.id
    ORDER BY e.date ASC
    LIMIT 5`);
  const [categoryBreakdown] = await pool.query(`SELECT 
      category,
      COUNT(*) as count,
      SUM(CASE WHEN ${ACCEPTED_STATUS_SQL} THEN 1 ELSE 0 END) as approved
    FROM achievements
    GROUP BY category`);
  res.json({
    success: true,
    data: {
      students: studentCount[0].total,
      achievements: achievementStats[0],
      events: {
        total: eventStats[0].total,
        upcoming: eventStats[0].upcoming,
        past: eventStats[0].past
      },
      registrations: registrationCount[0].total,
      recentAchievements,
      upcomingEvents,
      categoryBreakdown
    }
  });
});
export const getAchievementStats = asyncHandler(async (req, res) => {
  const {
    start_date,
    end_date,
    category
  } = req.query;
  let query = 'SELECT * FROM achievements WHERE 1=1';
  const params = [];
  if (start_date) {
    query += ' AND date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND date <= ?';
    params.push(end_date);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  const [achievements] = await pool.query(query, params);
  const stats = {
    total: achievements.length,
    approved: achievements.filter(a => a.status === 'accepted' || a.status === 'approved').length,
    pending: achievements.filter(a => a.status === 'pending').length,
    rejected: achievements.filter(a => a.status === 'rejected').length,
    totalPoints: achievements.reduce((sum, a) => sum + (a.points || 0), 0)
  };
  const byCategory = achievements.reduce((acc, a) => {
    if (!acc[a.category]) {
      acc[a.category] = {
        count: 0,
        approved: 0,
        points: 0
      };
    }
    acc[a.category].count++;
    if (a.status === 'accepted' || a.status === 'approved') {
      acc[a.category].approved++;
      acc[a.category].points += a.points || 0;
    }
    return acc;
  }, {});
  const byMonth = achievements.reduce((acc, a) => {
    const month = new Date(a.date).toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = {
        count: 0,
        approved: 0
      };
    }
    acc[month].count++;
    if (a.status === 'accepted' || a.status === 'approved') {
      acc[month].approved++;
    }
    return acc;
  }, {});
  const [topStudents] = await pool.query(`SELECT 
      u.id, u.name, u.student_id,
      COUNT(a.id) as total_achievements,
      SUM(CASE WHEN a.status IN ('accepted', 'approved') THEN 1 ELSE 0 END) as approved_achievements,
      SUM(CASE WHEN a.status IN ('accepted', 'approved') THEN a.points ELSE 0 END) as total_points
    FROM users u
    LEFT JOIN achievements a ON u.id = a.student_id
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY total_points DESC
    LIMIT 10`);
  res.json({
    success: true,
    data: {
      overview: stats,
      byCategory,
      byMonth,
      topStudents
    }
  });
});
export const getPendingAchievements = asyncHandler(async (req, res) => {
  const [achievements] = await pool.query(`SELECT
      a.*,
      u.name as student_name,
      u.student_id as student_number,
      u.email as student_email
    FROM achievements a
    JOIN users u ON a.student_id = u.id
    WHERE a.status = 'pending'
    ORDER BY a.created_at DESC`);
  res.json({
    success: true,
    count: achievements.length,
    data: achievements
  });
});
export const getEventStats = asyncHandler(async (req, res) => {
  const {
    start_date,
    end_date,
    category
  } = req.query;
  let query = 'SELECT * FROM events WHERE 1=1';
  const params = [];
  if (start_date) {
    query += ' AND date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    query += ' AND date <= ?';
    params.push(end_date);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  const [events] = await pool.query(query, params);
  for (let event of events) {
    const [count] = await pool.query("SELECT COUNT(*) as total FROM event_registrations WHERE event_id = ? AND status = 'registered'", [event.id]);
    event.registration_count = count[0].total;
    event.fill_rate = (count[0].total / event.max_participants * 100).toFixed(2);
  }
  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.date) >= new Date()).length,
    past: events.filter(e => new Date(e.date) < new Date()).length,
    totalRegistrations: events.reduce((sum, e) => sum + e.registration_count, 0),
    averageFillRate: events.length > 0
      ? (events.reduce((sum, e) => sum + parseFloat(e.fill_rate), 0) / events.length).toFixed(2)
      : '0.00'
  };
  const byCategory = events.reduce((acc, e) => {
    if (!acc[e.category]) {
      acc[e.category] = {
        count: 0,
        registrations: 0
      };
    }
    acc[e.category].count++;
    acc[e.category].registrations += e.registration_count;
    return acc;
  }, {});
  const byMonth = events.reduce((acc, e) => {
    const month = new Date(e.date).toISOString().slice(0, 7);
    if (!acc[month]) {
      acc[month] = {
        count: 0,
        registrations: 0
      };
    }
    acc[month].count++;
    acc[month].registrations += e.registration_count;
    return acc;
  }, {});
  const popularEvents = [...events].sort((a, b) => b.registration_count - a.registration_count).slice(0, 10).map(e => ({
    id: e.id,
    title: e.title,
    date: e.date,
    registrations: e.registration_count,
    capacity: e.max_participants,
    fillRate: e.fill_rate
  }));
  res.json({
    success: true,
    data: {
      overview: stats,
      byCategory,
      byMonth,
      popularEvents,
      allEvents: events
    }
  });
});
