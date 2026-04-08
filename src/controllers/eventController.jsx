import pool from '../config/database.jsx';
import { asyncHandler } from '../middleware/errorHandler.jsx';
export const getEvents = asyncHandler(async (req, res) => {
  const {
    category,
    status,
    upcoming
  } = req.query;
  let query = `
    SELECT 
      e.*,
      u.name as created_by_name,
      COUNT(DISTINCT er.id) as registered_count
    FROM events e
    LEFT JOIN users u ON e.created_by = u.id
    LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'registered'
    WHERE 1=1
  `;
  const params = [];
  if (category) {
    query += ' AND e.category = ?';
    params.push(category);
  }
  if (status) {
    query += ' AND e.status = ?';
    params.push(status);
  }
  if (upcoming === 'true') {
    query += ' AND e.date >= CURDATE()';
  }
  query += ' GROUP BY e.id ORDER BY e.date ASC';
  const [events] = await pool.query(query, params);
  for (let event of events) {
    const [registrations] = await pool.query(`SELECT u.name 
       FROM event_registrations er 
       JOIN users u ON er.student_id = u.id 
       WHERE er.event_id = ? AND er.status = 'registered'`, [event.id]);
    event.registeredStudents = registrations.map(r => r.name);
  }
  res.json({
    success: true,
    count: events.length,
    data: events
  });
});
export const getEvent = asyncHandler(async (req, res) => {
  const [events] = await pool.query(`SELECT 
      e.*,
      u.name as created_by_name,
      COUNT(DISTINCT er.id) as registered_count
    FROM events e
    LEFT JOIN users u ON e.created_by = u.id
    LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'registered'
    WHERE e.id = ?
    GROUP BY e.id`, [req.params.id]);
  if (events.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  const [registrations] = await pool.query(`SELECT u.id, u.name, u.email, u.student_id, er.registered_at
     FROM event_registrations er
     JOIN users u ON er.student_id = u.id
     WHERE er.event_id = ? AND er.status = 'registered'
     ORDER BY er.registered_at DESC`, [req.params.id]);
  const event = events[0];
  event.registeredStudents = registrations.map(r => r.name);
  event.registrations = registrations;
  res.json({
    success: true,
    data: event
  });
});
export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    time,
    location,
    maxParticipants,
    category
  } = req.body;
  if (!title || !date || !time || !location || !maxParticipants) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields'
    });
  }
  const [result] = await pool.query(`INSERT INTO events (title, description, date, time, location, max_participants, category, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [title, description, date, time, location, maxParticipants, category || 'Other', req.user.id]);
  const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: events[0]
  });
});
export const updateEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    time,
    location,
    maxParticipants,
    category,
    status
  } = req.body;
  const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  if (events.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  await pool.query(`UPDATE events 
     SET title = ?, description = ?, date = ?, time = ?, location = ?, 
         max_participants = ?, category = ?, status = ?
     WHERE id = ?`, [title, description, date, time, location, maxParticipants, category, status || events[0].status, req.params.id]);
  const [updatedEvents] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  res.json({
    success: true,
    message: 'Event updated successfully',
    data: updatedEvents[0]
  });
});
export const deleteEvent = asyncHandler(async (req, res) => {
  const [events] = await pool.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
  if (events.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
});
export const registerForEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const studentId = req.user.id;
  const [events] = await pool.query(`SELECT e.*, COUNT(DISTINCT er.id) as registered_count
     FROM events e
     LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status = 'registered'
     WHERE e.id = ?
     GROUP BY e.id`, [eventId]);
  if (events.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }
  const event = events[0];
  if (event.registered_count >= event.max_participants) {
    return res.status(400).json({
      success: false,
      message: 'Event is full'
    });
  }
  const [existing] = await pool.query('SELECT * FROM event_registrations WHERE event_id = ? AND student_id = ?', [eventId, studentId]);
  if (existing.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Already registered for this event'
    });
  }
  await pool.query('INSERT INTO event_registrations (event_id, student_id) VALUES (?, ?)', [eventId, studentId]);
  await pool.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)', [studentId, 'Event Registration Confirmed', `You have successfully registered for ${event.title}`, 'event']);
  res.json({
    success: true,
    message: 'Successfully registered for event'
  });
});
export const unregisterFromEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const studentId = req.user.id;
  const [registrations] = await pool.query('SELECT * FROM event_registrations WHERE event_id = ? AND student_id = ?', [eventId, studentId]);
  if (registrations.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'Registration not found'
    });
  }
  await pool.query('DELETE FROM event_registrations WHERE event_id = ? AND student_id = ?', [eventId, studentId]);
  res.json({
    success: true,
    message: 'Successfully unregistered from event'
  });
});
export const getEventRegistrations = asyncHandler(async (req, res) => {
  const [registrations] = await pool.query(`SELECT 
      er.*,
      u.name, u.email, u.student_id, u.department, u.year
    FROM event_registrations er
    JOIN users u ON er.student_id = u.id
    WHERE er.event_id = ?
    ORDER BY er.registered_at DESC`, [req.params.id]);
  res.json({
    success: true,
    count: registrations.length,
    data: registrations
  });
});
