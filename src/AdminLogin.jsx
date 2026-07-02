import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/axios';
import { useAuth } from './context/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userFocused, setUserFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [shake, setShake] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid username or password');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-paper flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-ink overflow-hidden flex-col justify-between p-12">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/10 -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-accent/5 translate-y-1/3 -translate-x-1/4 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-40 bg-gradient-to-b from-transparent via-accent/20 to-transparent" />

        {/* Top */}
        <div className="relative z-10">
          <div className="font-serif text-3xl text-paper/90">
            My<span className="italic text-accent">Blog</span>
          </div>
        </div>

        {/* Center quote */}
        <div className="relative z-10 space-y-6">
          <div className="w-10 h-px bg-accent/40" />
          <blockquote className="font-serif text-2xl leading-relaxed text-paper/70 max-w-sm">
            "The scariest moment is always just before you start."
          </blockquote>
          <p className="text-[11px] uppercase tracking-[0.3em] text-paper/25 font-medium">
            Stephen King
          </p>
        </div>

        {/* Bottom */}
        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-[0.25em] text-paper/15">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          className={`w-full max-w-sm transition-transform duration-500 ${
            shake ? 'animate-[shake_0.5s_ease-in-out]' : ''
          }`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 text-center">
            <div className="font-serif text-3xl text-ink">
              My<span className="italic text-accent">Blog</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-ink/20 mt-2 font-medium">
              Admin Portal
            </p>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h1 className="font-serif text-3xl tracking-tight text-ink">
              Welcome back
            </h1>
            <p className="text-sm text-ink/35 mt-2 leading-relaxed">
              Sign in to your admin account to manage your blog.
            </p>
          </div>

          {/* Error */}
          <div
            className={`overflow-hidden transition-all duration-400 ${
              error ? 'max-h-20 opacity-100 mb-5' : 'max-h-0 opacity-0 mb-0'
            }`}
          >
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200/60 text-red-600 text-[13px] font-medium px-4 py-3 rounded-xl">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-1">
            {/* Username field */}
            <div className="relative">
              <label
                className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
                  userFocused || username
                    ? 'top-1.5 text-[10px] uppercase tracking-[0.2em] text-accent font-semibold'
                    : 'top-[14px] text-sm text-ink/25'
                }`}
              >
                Username
              </label>
              <div
                className={`flex items-center border-b transition-colors duration-300 rounded-t-md ${
                  userFocused ? 'border-accent' : 'border-hairline'
                }`}
              >
                <svg
                  className={`w-4 h-4 ml-4 mr-3 flex-shrink-0 transition-colors duration-300 ${
                    userFocused ? 'text-accent' : 'text-ink/15'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setUserFocused(true)}
                  onBlur={() => setUserFocused(false)}
                  className="flex-1 bg-transparent pt-7 pb-3 pr-4 text-sm text-ink outline-none"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password field */}
            <div className="relative mt-5">
              <label
                className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
                  passFocused || password
                    ? 'top-1.5 text-[10px] uppercase tracking-[0.2em] text-accent font-semibold'
                    : 'top-[14px] text-sm text-ink/25'
                }`}
              >
                Password
              </label>
              <div
                className={`flex items-center border-b transition-colors duration-300 rounded-t-md ${
                  passFocused ? 'border-accent' : 'border-hairline'
                }`}
              >
                <svg
                  className={`w-4 h-4 ml-4 mr-3 flex-shrink-0 transition-colors duration-300 ${
                    passFocused ? 'text-accent' : 'text-ink/15'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  className="flex-1 bg-transparent pt-7 pb-3 pr-4 text-sm text-ink outline-none"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="mr-4 p-1 text-ink/20 hover:text-ink/50 transition-colors duration-200"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className={`group w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[13px] font-semibold uppercase tracking-wide transition-all duration-300 ${
                  loading
                    ? 'bg-ink/80 text-paper/60 cursor-wait'
                    : 'bg-ink text-paper hover:bg-ink/85 hover:shadow-xl hover:shadow-ink/10 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg
                      className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Back link */}
          <div className="mt-10 text-center">
            <a
              href="/"
              className="group inline-flex items-center gap-1.5 text-[13px] text-ink/25 hover:text-ink/50 transition-colors duration-300"
            >
              <svg
                className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to blog
            </a>
          </div>

          {/* Decorative bottom line */}
          <div className="mt-12 flex items-center gap-3">
            <div className="flex-1 h-px bg-hairline/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-accent/20" />
            <div className="flex-1 h-px bg-hairline/60" />
          </div>
        </div>
      </div>

      {/* Shake animation keyframes injected via style tag */}
      {shake && (
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
          }
        `}</style>
      )}
    </div>
  );
};

export default AdminLogin;