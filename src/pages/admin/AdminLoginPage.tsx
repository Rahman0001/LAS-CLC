import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { CrestLogo } from '../../components/CrestLogo';
import { Lock, User, KeyRound, ShieldAlert, ArrowLeft, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const performLogin = async (usr: string, pwd: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await login(usr, pwd);
    setIsSubmitting(false);

    if (result.success) {
      addToast('success', 'Authenticated as Legal Aid Society Administrator.');
      navigate('/admin');
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please check credentials.');
      addToast('error', result.error || 'Invalid credentials');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(username, password);
  };

  const handleQuickLogin = async () => {
    setUsername('admin');
    setPassword('admin123');
    await performLogin('admin', 'admin123');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 bg-[#f4f1eb]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e2ded5] overflow-hidden">
        {/* Header */}
        <div className="bg-[#0c1829] text-white p-6 sm:p-8 text-center border-b-2 border-[#c59b43]/50 space-y-3">
          <div className="flex justify-center">
            <CrestLogo size="md" variant="light" />
          </div>
          <div className="pt-2">
            <h1 className="font-serif text-lg sm:text-xl font-bold text-white tracking-wide">
              Society Administrative Secretariat
            </h1>
            <p className="text-xs text-[#c59b43] font-medium tracking-wider uppercase">
              Authorized Personnel Portal
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Access Helper Banner */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-xl text-xs text-amber-950 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Quick Access Credentials</span>
              </div>
              <span className="bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-white/80 p-2.5 rounded-lg border border-amber-200/60 font-mono">
              <div>
                <span className="text-gray-500 block text-[10px] font-sans font-medium uppercase">Username</span>
                <span className="font-bold text-[#0c1829]">admin</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px] font-sans font-medium uppercase">Password</span>
                <span className="font-bold text-[#0c1829]">admin123</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={isSubmitting}
              className="w-full py-2 px-3 bg-[#c59b43] hover:bg-[#b08836] text-[#0c1829] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0c1829]" />
              <span>Click for 1-Click Instant Login</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-medium">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Administrative Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-[#fcfbf9] border border-[#e2ded5] rounded-lg focus:outline-none focus:border-[#c59b43]"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Passphrase / Secret Key
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-[#fcfbf9] border border-[#e2ded5] rounded-lg focus:outline-none focus:border-[#c59b43]"
                  placeholder="admin123"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-[#0c1829] hover:bg-[#162740] disabled:bg-gray-400 text-white font-bold text-sm rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-[#c59b43]" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#e2ded5] text-center flex items-center justify-between text-xs text-gray-500">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 hover:text-[#0c1829] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Site</span>
            </Link>

            <span className="text-[11px] text-gray-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              PBKDF2 Secured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
