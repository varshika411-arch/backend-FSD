class DataService {
  STORAGE_KEYS = {
    USERS: 'sam_users',
    ACHIEVEMENTS: 'sam_achievements',
    EVENTS: 'sam_events',
    NOTIFICATIONS: 'sam_notifications',
    PORTFOLIO: 'sam_portfolio',
    CURRENT_USER: 'sam_current_user'
  };

  initialize() {
    if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
      const defaultUsers = [{
        id: '1',
        name: 'John Doe',
        email: 'student@test.com',
        password: 'password',
        role: 'student',
        studentId: 'STU2024001',
        department: 'Computer Science',
        year: '3rd Year',
        cgpa: '3.8',
        phone: '+1234567890',
        dateOfBirth: '2003-05-15',
        bio: 'Passionate about technology and innovation',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        interests: ['Web Development', 'AI/ML', 'Competitive Programming']
      }, {
        id: '2',
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'admin',
        role: 'admin'
      }];
      this.saveUsers(defaultUsers);
    }

    if (!localStorage.getItem(this.STORAGE_KEYS.EVENTS)) {
      const defaultEvents = [{
        id: '1',
        title: 'Annual Tech Symposium 2026',
        description: 'Join us for a day of innovation and learning with industry experts sharing insights on emerging technologies.',
        date: '2026-05-15',
        time: '09:00',
        location: 'Main Auditorium',
        maxParticipants: 200,
        registeredCount: 45,
        category: 'Technical',
        registeredStudents: [],
        organizer: 'CS Department',
        status: 'upcoming'
      }, {
        id: '2',
        title: 'Spring Sports Festival',
        description: 'Annual sports event featuring various competitions including track and field, basketball, and soccer.',
        date: '2026-04-20',
        time: '08:00',
        location: 'University Sports Complex',
        maxParticipants: 500,
        registeredCount: 320,
        category: 'Sports',
        registeredStudents: [],
        organizer: 'Sports Committee',
        status: 'upcoming'
      }, {
        id: '3',
        title: 'Cultural Night: Diversity Celebration',
        description: 'Celebrate diversity with performances, food, and art from various cultures around the world.',
        date: '2026-04-25',
        time: '18:00',
        location: 'Student Center',
        maxParticipants: 150,
        registeredCount: 85,
        category: 'Cultural',
        registeredStudents: [],
        organizer: 'Cultural Committee',
        status: 'upcoming'
      }];
      this.saveEvents(defaultEvents);
    }

    if (!localStorage.getItem(this.STORAGE_KEYS.ACHIEVEMENTS)) {
      this.saveAchievements([]);
    }

    if (!localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS)) {
      this.saveNotifications([]);
    }

    if (!localStorage.getItem(this.STORAGE_KEYS.PORTFOLIO)) {
      this.savePortfolio([]);
    }
  }

  saveUsers(users) {
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getUsers() {
    const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  getAdmins() {
    return this.getUsers().filter(user => user.role === 'admin');
  }

  getUserByEmail(email) {
    return this.getUsers().find(u => u.email === email);
  }

  getUserById(id) {
    return this.getUsers().find(u => u.id === id);
  }

  normalizeUser(user) {
    if (!user) {
      return user;
    }

    return {
      ...user,
      studentId: user.studentId ?? user.student_id ?? ''
    };
  }

  upsertUser(user) {
    const normalizedUser = this.normalizeUser(user);
    const users = this.getUsers();
    const index = users.findIndex(u => u.email === normalizedUser.email || u.id === normalizedUser.id);

    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...normalizedUser
      };
      this.saveUsers(users);
      return users[index];
    }

    users.push(normalizedUser);
    this.saveUsers(users);
    return normalizedUser;
  }

  createUser(user) {
    const users = this.getUsers();
    const newUser = {
      ...user,
      id: Date.now().toString()
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  updateUser(id, updates) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);

    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...updates
      };
      this.saveUsers(users);
      return users[index];
    }

    return undefined;
  }

  deleteUser(id) {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);

    if (filtered.length < users.length) {
      this.saveUsers(filtered);
      return true;
    }

    return false;
  }

  login(email, password) {
    const user = this.getUserByEmail(email);
    if (user && user.password === password) {
      localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      return user;
    }
    return null;
  }

  logout() {
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
  }

  getCurrentUser() {
    const data = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  saveAchievements(achievements) {
    localStorage.setItem(this.STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }

  getAchievements() {
    const data = localStorage.getItem(this.STORAGE_KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : [];
  }

  getAchievementsByStudent(studentId) {
    return this.getAchievements().filter(a => a.studentId === studentId);
  }

  getAchievementById(id) {
    return this.getAchievements().find(a => a.id === id);
  }

  createAchievement(achievement) {
    const achievements = this.getAchievements();
    const newAchievement = {
      ...achievement,
      id: Date.now().toString(),
      status: achievement.status || 'pending',
      submittedAt: new Date().toISOString()
    };

    achievements.push(newAchievement);
    this.saveAchievements(achievements);

    this.createNotification({
      userId: achievement.studentId,
      title: 'Achievement Submitted',
      message: `Your achievement "${achievement.title}" has been submitted for verification.`,
      type: 'info',
      read: false
    });

    this.getAdmins().forEach(admin => {
      this.createNotification({
        userId: admin.id,
        title: 'New Achievement Waiting',
        message: `${achievement.studentName} submitted "${achievement.title}" for review.`,
        type: 'info',
        read: false
      });
    });

    return newAchievement;
  }

  updateAchievement(id, updates) {
    const achievements = this.getAchievements();
    const index = achievements.findIndex(a => a.id === id);

    if (index !== -1) {
      const oldAchievement = achievements[index];
      achievements[index] = {
        ...achievements[index],
        ...updates
      };
      this.saveAchievements(achievements);

      if (updates.status && updates.status !== oldAchievement.status) {
        const achievement = achievements[index];

        if (updates.status === 'approved') {
          this.createNotification({
            userId: achievement.studentId,
            title: 'Achievement Accepted',
            message: `Your achievement "${achievement.title}" has been approved${updates.verifiedBy ? ` by ${updates.verifiedBy}` : ''}.`,
            type: 'success',
            read: false
          });
        } else if (updates.status === 'rejected') {
          this.createNotification({
            userId: achievement.studentId,
            title: 'Achievement Rejected',
            message: `Your achievement "${achievement.title}" was rejected. ${updates.rejectionReason || ''}`.trim(),
            type: 'warning',
            read: false
          });
        }
      }

      return achievements[index];
    }

    return undefined;
  }

  deleteAchievement(id) {
    const achievements = this.getAchievements();
    const filtered = achievements.filter(a => a.id !== id);

    if (filtered.length < achievements.length) {
      this.saveAchievements(filtered);
      return true;
    }

    return false;
  }

  saveEvents(events) {
    localStorage.setItem(this.STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }

  getEvents() {
    const data = localStorage.getItem(this.STORAGE_KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  }

  getEventById(id) {
    return this.getEvents().find(e => e.id === id);
  }

  createEvent(event) {
    const events = this.getEvents();
    const newEvent = {
      ...event,
      id: Date.now().toString(),
      registeredCount: 0,
      registeredStudents: []
    };

    events.push(newEvent);
    this.saveEvents(events);

    const students = this.getUsers().filter(u => u.role === 'student');
    students.forEach(student => {
      this.createNotification({
        userId: student.id,
        title: 'New Event Available',
        message: `${event.title} has been scheduled for ${event.date}.`,
        type: 'info',
        read: false
      });
    });

    return newEvent;
  }

  updateEvent(id, updates) {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === id);

    if (index !== -1) {
      events[index] = {
        ...events[index],
        ...updates
      };
      this.saveEvents(events);
      return events[index];
    }

    return undefined;
  }

  deleteEvent(id) {
    const events = this.getEvents();
    const event = events.find(e => e.id === id);

    if (event && event.registeredStudents.length > 0) {
      const students = this.getUsers().filter(u => u.role === 'student' && event.registeredStudents.includes(u.name));
      students.forEach(student => {
        this.createNotification({
          userId: student.id,
          title: 'Event Cancelled',
          message: `The event "${event.title}" has been cancelled.`,
          type: 'warning',
          read: false
        });
      });
    }

    const filtered = events.filter(e => e.id !== id);
    if (filtered.length < events.length) {
      this.saveEvents(filtered);
      return true;
    }

    return false;
  }

  registerForEvent(eventId, studentId, studentName) {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === eventId);

    if (index !== -1) {
      const event = events[index];
      if (event.registeredCount < event.maxParticipants && !event.registeredStudents.includes(studentName)) {
        event.registeredCount += 1;
        event.registeredStudents.push(studentName);
        this.saveEvents(events);
        this.createNotification({
          userId: studentId,
          title: 'Event Registration Successful',
          message: `You have successfully registered for "${event.title}".`,
          type: 'success',
          read: false
        });
        return true;
      }
    }

    return false;
  }

  unregisterFromEvent(eventId, studentId, studentName) {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === eventId);

    if (index !== -1) {
      const event = events[index];
      if (event.registeredStudents.includes(studentName)) {
        event.registeredCount -= 1;
        event.registeredStudents = event.registeredStudents.filter(s => s !== studentName);
        this.saveEvents(events);
        this.createNotification({
          userId: studentId,
          title: 'Event Unregistration',
          message: `You have unregistered from "${event.title}".`,
          type: 'info',
          read: false
        });
        return true;
      }
    }

    return false;
  }

  saveNotifications(notifications) {
    localStorage.setItem(this.STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }

  getNotifications() {
    const data = localStorage.getItem(this.STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  }

  getNotificationsByUser(userId) {
    return this.getNotifications()
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(notification) {
    const notifications = this.getNotifications();
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    notifications.push(newNotification);
    this.saveNotifications(notifications);
    return newNotification;
  }

  markNotificationAsRead(id) {
    const notifications = this.getNotifications();
    const index = notifications.findIndex(n => n.id === id);

    if (index !== -1) {
      notifications[index].read = true;
      this.saveNotifications(notifications);
      return true;
    }

    return false;
  }

  markAllNotificationsAsRead(userId) {
    const notifications = this.getNotifications();
    let updated = false;

    notifications.forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        updated = true;
      }
    });

    if (updated) {
      this.saveNotifications(notifications);
    }

    return updated;
  }

  deleteNotification(id) {
    const notifications = this.getNotifications();
    const filtered = notifications.filter(n => n.id !== id);

    if (filtered.length < notifications.length) {
      this.saveNotifications(filtered);
      return true;
    }

    return false;
  }

  savePortfolio(items) {
    localStorage.setItem(this.STORAGE_KEYS.PORTFOLIO, JSON.stringify(items));
  }

  getPortfolio() {
    const data = localStorage.getItem(this.STORAGE_KEYS.PORTFOLIO);
    return data ? JSON.parse(data) : [];
  }

  getPortfolioByStudent(studentId) {
    return this.getPortfolio().filter(p => p.studentId === studentId);
  }

  createPortfolioItem(item) {
    const portfolio = this.getPortfolio();
    const newItem = {
      ...item,
      id: Date.now().toString()
    };

    portfolio.push(newItem);
    this.savePortfolio(portfolio);
    return newItem;
  }

  updatePortfolioItem(id, updates) {
    const portfolio = this.getPortfolio();
    const index = portfolio.findIndex(p => p.id === id);

    if (index !== -1) {
      portfolio[index] = {
        ...portfolio[index],
        ...updates
      };
      this.savePortfolio(portfolio);
      return portfolio[index];
    }

    return undefined;
  }

  deletePortfolioItem(id) {
    const portfolio = this.getPortfolio();
    const filtered = portfolio.filter(p => p.id !== id);

    if (filtered.length < portfolio.length) {
      this.savePortfolio(filtered);
      return true;
    }

    return false;
  }

  getStudentStats(studentId) {
    const achievements = this.getAchievementsByStudent(studentId);
    const portfolio = this.getPortfolioByStudent(studentId);
    const events = this.getEvents();
    const user = this.getUserById(studentId);
    const registeredEvents = events.filter(e => user && e.registeredStudents.includes(user.name)).length;

    return {
      totalAchievements: achievements.length,
      approvedAchievements: achievements.filter(a => a.status === 'approved').length,
      pendingAchievements: achievements.filter(a => a.status === 'pending').length,
      rejectedAchievements: achievements.filter(a => a.status === 'rejected').length,
      totalPoints: achievements.filter(a => a.status === 'approved').reduce((sum, a) => sum + (a.points || 0), 0),
      portfolioItems: portfolio.length,
      eventsRegistered: registeredEvents
    };
  }

  getAdminStats() {
    const users = this.getUsers();
    const achievements = this.getAchievements();
    const events = this.getEvents();

    return {
      totalStudents: users.filter(u => u.role === 'student').length,
      totalAchievements: achievements.length,
      pendingAchievements: achievements.filter(a => a.status === 'pending').length,
      approvedAchievements: achievements.filter(a => a.status === 'approved').length,
      rejectedAchievements: achievements.filter(a => a.status === 'rejected').length,
      totalEvents: events.length,
      upcomingEvents: events.filter(e => new Date(e.date) > new Date()).length,
      totalEventRegistrations: events.reduce((sum, e) => sum + e.registeredCount, 0)
    };
  }

  clearAllData() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  exportData() {
    return {
      users: this.getUsers().map(u => ({
        ...u,
        password: undefined
      })),
      achievements: this.getAchievements(),
      events: this.getEvents(),
      notifications: this.getNotifications(),
      portfolio: this.getPortfolio()
    };
  }
}

export const dataService = new DataService();
