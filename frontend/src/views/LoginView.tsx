import React, { useState } from 'react';
import { useAuthViewModel } from '../viewmodels/useAuthViewModel';
import { BookOpen, Lock, User as UserIcon, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, register, error, clearError, isLoading } = useAuthViewModel();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'teacher' | 'student'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!username.trim() || !password.trim()) {
      setLocalError('All fields are required');
      return;
    }

    if (!isLogin && password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password, role);
      }
    } catch (err) {
      // Errors are handled in auth viewmodel and stored in context
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setPassword('');
    setLocalError(null);
    clearError();
  };

  const displayError = localError || error;

  return (
    <div className="min-height-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-purple-950 to-slate-950 px-4 py-12 relative overflow-hidden" style={{ minHeight: '100vh' }}>
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 overflow-hidden transform transition-all hover:border-purple-500/30">
        
        {/* Top Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/30 mb-4 animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent mb-1 text-center">
            LibroLink
          </h1>
          <p className="text-slate-400 text-sm text-center">
            {isLogin ? 'Welcome back! Please sign in' : 'Create an account to get started'}
          </p>
        </div>

        {/* Error Notification */}
        {displayError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm flex items-start space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
            <span>{displayError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <UserIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-slate-950/40 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Role selector (Register only) */}
          {!isLogin && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-3 px-4 rounded-xl border font-medium text-sm flex items-center justify-center space-x-2 transition-all ${
                    role === 'student'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-md shadow-purple-900/10'
                      : 'bg-slate-950/20 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                  disabled={isLoading}
                >
                  <span>🎓 Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-3 px-4 rounded-xl border font-medium text-sm flex items-center justify-center space-x-2 transition-all ${
                    role === 'teacher'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-200 shadow-md shadow-purple-900/10'
                      : 'bg-slate-950/20 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                  disabled={isLoading}
                >
                  <span>💼 Teacher</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-purple-950/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <button
            onClick={handleToggleMode}
            className="text-sm text-slate-400 hover:text-purple-400 transition-colors inline-flex items-center space-x-1"
            disabled={isLoading}
          >
            {isLogin ? (
              <>
                <span>New to LibroLink?</span>
                <span className="text-purple-400 font-medium">Create an account</span>
              </>
            ) : (
              <>
                <span>Already have an account?</span>
                <span className="text-purple-400 font-medium">Sign in</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default LoginView;
