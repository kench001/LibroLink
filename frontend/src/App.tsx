import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthViewModel } from './viewmodels/useAuthViewModel';
import LoginView from './views/LoginView';
import TeacherDashboardView from './views/TeacherDashboardView';
import StudentDashboardView from './views/StudentDashboardView';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, isCheckingAuth } = useAuthViewModel();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400" style={{ minHeight: '100vh' }}>
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium tracking-wide">Connecting to LibroLink...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginView />}
      />
      <Route
        path="/"
        element={
          !isAuthenticated ? (
            <Navigate to="/login" replace />
          ) : user?.role === 'teacher' ? (
            <TeacherDashboardView />
          ) : (
            <StudentDashboardView />
          )
        }
      />
      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
export type AppType = typeof App;
