import { useState } from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { LoginModal } from '../components/LoginModal';
import { RegisterModal } from '../components/RegisterModal';
import { StudentDashboard } from '../components/StudentDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { Footer } from '../components/Footer';
import { Toaster } from '../components/ui/sonner';
import { AppProvider, useApp } from '../contexts/AppContext';
function AppContent() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [pendingLogin, setPendingLogin] = useState({
    email: ''
  });
  const {
    currentUser,
    login,
    logout,
    register
  } = useApp();
  const handleLogin = async (email, password) => {
    const success = await login(email, password);
    if (success) {
      setIsLoginModalOpen(false);
    }
  };
  const handleRegister = async registerData => {
    const success = await register(registerData);
    if (success) {
      setPendingLogin({
        email: registerData.email || ''
      });
      setIsRegisterModalOpen(false);
      setIsLoginModalOpen(true);
    }
    return success;
  };
  return <div className="min-h-screen bg-[#f5f7fb]">
      {!currentUser && <>
          <Header onLoginClick={() => setIsLoginModalOpen(true)} onRegisterClick={() => setIsRegisterModalOpen(true)} />
          <Hero onGetStartedClick={() => setIsRegisterModalOpen(true)} onLearnMoreClick={() => {
        document.getElementById('features')?.scrollIntoView({
          behavior: 'smooth'
        });
      }} />
          <Features />
          <Footer />
        </>}

      {currentUser?.role === 'student' && <StudentDashboard userName={currentUser.name} onLogout={logout} />}

      {currentUser?.role === 'admin' && <AdminDashboard userName={currentUser.name} onLogout={logout} />}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} defaultEmail={pendingLogin.email} onShowRegister={() => {
      setIsLoginModalOpen(false);
      setIsRegisterModalOpen(true);
    }} />

      <RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} onRegister={handleRegister} onShowLogin={() => {
      setIsRegisterModalOpen(false);
      setIsLoginModalOpen(true);
    }} />

      <Toaster />
    </div>;
}
function App() {
  return <AppProvider>
      <AppContent />
    </AppProvider>;
}
export default App;
