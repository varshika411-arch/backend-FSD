import { createContext, useContext, useState, useEffect } from 'react';
import { api, TOKEN_KEY } from '../services/api';
import { toast } from 'sonner';

const AppContext = createContext(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('sam_current_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [users, setUsers] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [events, setEvents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [stats, setStats] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (currentUser) loadUserData(currentUser);
  }, []);

  const loadUserData = (user) => {
    refreshEvents();
    if (user.role === 'student') {
      refreshAchievements();
      refreshNotifications();
      refreshStats(user);
    } else if (user.role === 'admin') {
      refreshUsers();
      refreshAchievements();
      refreshNotifications();
      refreshStats(user);
    }
  };

  // ─── AUTH ────────────────────────────────────────────────────────────────────

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (!data.success) {
        toast.error(data.message || 'Invalid email or password');
        return false;
      }
      const user = { ...data.data.user, studentId: data.data.user.student_id || '' };
      localStorage.setItem(TOKEN_KEY, data.data.token);
      localStorage.setItem('sam_current_user', JSON.stringify(user));
      setCurrentUser(user);
      loadUserData(user);
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg || 'Login failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('sam_current_user');
    setCurrentUser(null);
    setUsers([]); setAchievements([]); setEvents([]);
    setNotifications([]); setPortfolio([]); setStats({});
    toast.info('Logged out successfully');
  };

  const register = async (registerData) => {
    try {
      const { data } = await api.post('/auth/register', registerData);
      if (!data.success) {
        toast.error(data.message || 'Registration failed');
        return false;
      }
      toast.success('Registration successful. Please log in.');
      return true;
    } catch (err) {
      const msg = err?.response?.data?.message;
      toast.error(msg || 'Registration failed. Please try again.');
      return false;
    }
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return false;
    try {
      const { data } = await api.put(`/students/${currentUser.id}`, {
        name: updates.name,
        phone: updates.phone,
        department: updates.department,
        year: updates.year,
        bio: updates.bio,
        cgpa: updates.cgpa,
        dateOfBirth: updates.dateOfBirth
      });
      const raw = data.data;
      const updated = {
        ...currentUser,
        name: raw.name,
        phone: raw.phone || '',
        department: raw.department || '',
        year: raw.year || '',
        bio: raw.bio || '',
        cgpa: raw.cgpa || '',
        dateOfBirth: raw.date_of_birth || '',
        studentId: raw.student_id || currentUser.studentId || ''
      };
      setCurrentUser(updated);
      localStorage.setItem('sam_current_user', JSON.stringify(updated));
      toast.success('Profile updated successfully');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
      return false;
    }
  };

  // ─── USERS ───────────────────────────────────────────────────────────────────

  const refreshUsers = async () => {
    try {
      const { data } = await api.get('/students');
      const list = (data.data || []).map(s => ({
        ...s,
        studentId: s.student_id || s.studentId || '',
        role: s.role || 'student',
        phone: s.phone || '',
        department: s.department || '',
        year: s.year || '',
        cgpa: s.cgpa || '',
        bio: s.bio || ''
      }));
      setUsers(list);
    } catch {
      setUsers([]);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/students/${id}`);
      refreshUsers();
      toast.success('Student deleted successfully');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete student');
      return false;
    }
  };

  const updateStudent = async (id, updates) => {
    if (!currentUser || currentUser.role !== 'admin') return false;
    try {
      await api.put(`/students/${id}`, {
        name: updates.name,
        phone: updates.phone,
        department: updates.department,
        year: updates.year,
        bio: updates.bio,
        cgpa: updates.cgpa
      });
      await refreshUsers();
      toast.success('Student updated successfully');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update student');
      return false;
    }
  };

  // ─── ACHIEVEMENTS ─────────────────────────────────────────────────────────────

  const refreshAchievements = async () => {
    try {
      const { data } = await api.get('/achievements');
      const list = (data.data || []).map(a => ({
        ...a,
        studentName: a.student_name || a.studentName || '',
        studentId: a.student_id || a.studentId || '',
        evidenceUrl: a.evidence_url || a.evidenceUrl || '',
        verifiedBy: a.verified_by_name || a.verifiedBy || '',
        verifiedAt: a.verified_at || a.verifiedAt || '',
        rejectionReason: a.rejection_reason || a.rejectionReason || '',
        submittedAt: a.created_at || a.submittedAt || ''
      }));
      setAchievements(list);
    } catch {
      setAchievements([]);
    }
  };

  const submitAchievement = async (achievement) => {
    if (!currentUser || currentUser.role !== 'student') return false;
    try {
      const body = new FormData();
      body.append('title', achievement.title);
      body.append('description', achievement.description);
      body.append('category', achievement.category);
      body.append('date', achievement.date);
      if (achievement.evidenceFile) {
        body.append('evidence', achievement.evidenceFile);
      }
      await api.post('/achievements', body);
      await refreshAchievements();
      await refreshNotifications();
      await refreshStats(currentUser);
      toast.success('Achievement submitted successfully!');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit achievement');
      return false;
    }
  };

  const verifyAchievement = async (id, status, verifiedBy, rejectionReason) => {
    if (!currentUser || currentUser.role !== 'admin') return false;
    try {
      await api.put(`/achievements/${id}/verify`, {
        status,
        points: status === 'approved' ? 10 : 0,
        rejection_reason: rejectionReason || ''
      });
      await refreshAchievements();
      await refreshStats(currentUser);
      toast.success(`Achievement ${status} successfully`);
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to verify achievement');
      return false;
    }
  };

  const deleteAchievement = async (id) => {
    try {
      await api.delete(`/achievements/${id}`);
      await refreshAchievements();
      await refreshStats(currentUser);
      toast.success('Achievement deleted successfully');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete achievement');
      return false;
    }
  };

  // ─── EVENTS ──────────────────────────────────────────────────────────────────

  const refreshEvents = async () => {
    try {
      const { data } = await api.get('/events');
      const list = (data.data || []).map(e => ({
        ...e,
        maxParticipants: e.max_participants || e.maxParticipants || 0,
        registeredCount: Number(e.registered_count ?? e.registeredCount ?? 0),
        registeredStudents: e.registeredStudents || []
      }));
      setEvents(list);
    } catch {
      setEvents([]);
    }
  };

  const createEvent = async (event) => {
    if (!currentUser || currentUser.role !== 'admin') return false;
    try {
      await api.post('/events', {
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        maxParticipants: event.maxParticipants,
        category: event.category
      });
      await refreshEvents();
      toast.success('Event created successfully!');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create event');
      return false;
    }
  };

  const updateEvent = async (id, updates) => {
    if (!currentUser || currentUser.role !== 'admin') return false;
    try {
      await api.put(`/events/${id}`, {
        title: updates.title,
        description: updates.description,
        date: updates.date,
        time: updates.time,
        location: updates.location,
        maxParticipants: updates.maxParticipants,
        category: updates.category,
        status: updates.status
      });
      await refreshEvents();
      toast.success('Event updated successfully');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update event');
      return false;
    }
  };

  const deleteEvent = async (id) => {
    if (!currentUser || currentUser.role !== 'admin') return false;
    try {
      await api.delete(`/events/${id}`);
      await refreshEvents();
      toast.success('Event deleted successfully');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete event');
      return false;
    }
  };

  const registerForEvent = async (eventId) => {
    if (!currentUser || currentUser.role !== 'student') return false;
    try {
      await api.post(`/events/${eventId}/register`);
      await refreshEvents();
      await refreshNotifications();
      toast.success('Successfully registered for event!');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to register for event');
      return false;
    }
  };

  const unregisterFromEvent = async (eventId) => {
    if (!currentUser || currentUser.role !== 'student') return false;
    try {
      await api.delete(`/events/${eventId}/unregister`);
      await refreshEvents();
      await refreshNotifications();
      toast.success('Successfully unregistered from event');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to unregister from event');
      return false;
    }
  };

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

  const refreshNotifications = async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    try {
      const { data } = await api.get('/students/notifications');
      const list = data.data || [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.read).length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.put(`/students/notifications/${id}/read`);
      await refreshNotifications();
    } catch { /* silent */ }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/students/notifications/read-all');
      await refreshNotifications();
    } catch { /* silent */ }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/students/notifications/${id}`);
      await refreshNotifications();
      toast.success('Notification deleted');
    } catch { /* silent */ }
  };

  // ─── PORTFOLIO ────────────────────────────────────────────────────────────────

  const refreshPortfolio = async () => {
    if (!currentUser || currentUser.role !== 'student') return;
    try {
      const { data } = await api.get('/students/portfolio');
      setPortfolio(data.data || []);
    } catch {
      setPortfolio([]);
    }
  };

  const addPortfolioItem = async (item) => {
    if (!currentUser || currentUser.role !== 'student') return false;
    try {
      await api.post('/students/portfolio', item);
      await refreshPortfolio();
      toast.success('Portfolio item added successfully!');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add portfolio item');
      return false;
    }
  };

  const updatePortfolioItem = async (id, updates) => {
    try {
      await api.put(`/students/portfolio/${id}`, updates);
      await refreshPortfolio();
      toast.success('Portfolio item updated successfully');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update portfolio item');
      return false;
    }
  };

  const deletePortfolioItem = async (id) => {
    try {
      await api.delete(`/students/portfolio/${id}`);
      await refreshPortfolio();
      toast.success('Portfolio item deleted successfully');
      return true;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete portfolio item');
      return false;
    }
  };

  // ─── STATS ────────────────────────────────────────────────────────────────────

  const refreshStats = async (userOverride) => {
    const activeUser = userOverride || currentUser;
    if (!activeUser) return;
    try {
      if (activeUser.role === 'student') {
        const { data } = await api.get(`/students/${activeUser.id}`);
        const s = data.data?.stats?.achievements || {};
        const eventsCount = data.data?.stats?.events || 0;
        setStats({
          totalAchievements: Number(s.total || 0),
          approvedAchievements: Number(s.approved || 0),
          pendingAchievements: Number(s.pending || 0),
          rejectedAchievements: Number(s.rejected || 0),
          totalPoints: Number(s.total_points || 0),
          eventsRegistered: Number(eventsCount)
        });
      } else if (activeUser.role === 'admin') {
        const [achRes, evtRes, usrRes] = await Promise.all([
          api.get('/achievements'),
          api.get('/events'),
          api.get('/students')
        ]);
        const achs = achRes.data.data || [];
        const evts = evtRes.data.data || [];
        const usrs = usrRes.data.data || [];
        setStats({
          totalStudents: usrs.length,
          totalAchievements: achs.length,
          pendingAchievements: achs.filter(a => a.status === 'pending').length,
          approvedAchievements: achs.filter(a => a.status === 'approved').length,
          rejectedAchievements: achs.filter(a => a.status === 'rejected').length,
          totalEvents: evts.length,
          upcomingEvents: evts.filter(e => new Date(e.date) > new Date()).length,
          totalEventRegistrations: evts.reduce((s, e) => s + Number(e.registered_count || 0), 0)
        });
      }
    } catch {
      /* keep existing stats on error */
    }
  };

  const value = {
    currentUser, isAuthenticated: !!currentUser,
    login, logout, register, updateProfile,
    users, refreshUsers, updateStudent, deleteUser,
    achievements, refreshAchievements, submitAchievement, verifyAchievement, deleteAchievement,
    events, refreshEvents, createEvent, updateEvent, deleteEvent, registerForEvent, unregisterFromEvent,
    notifications, unreadCount, refreshNotifications, markNotificationAsRead, markAllAsRead, deleteNotification,
    portfolio, refreshPortfolio, addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
    stats, refreshStats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
