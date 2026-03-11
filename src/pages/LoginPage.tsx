import { useState, FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UnisphereWordmark } from '../components/UnisphereLogo';

interface LoginPageProps {
  onGoSignup: () => void;
}

export default function LoginPage({ onGoSignup }: LoginPageProps) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'Email is required.';
    else if (!email.endsWith('@srmist.edu.in')) errs.email = 'Please use your university email (@srmist.edu.in).';
    if (!password) errs.password = 'Password is required.';
    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});
    const result = await login(email, password);
    if (result.error) setError(result.error);
  };

  const inputBase = `
    w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium text-white
    placeholder-white/25 outline-none transition-all duration-200
  `;
  const inputStyle = (hasError?: string) => ({
    background: 'rgba(255,255,255,0.055)',
    border: `1px solid ${hasError ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.1)'}`,
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden gradient-bg">
      <div className="absolute top-[-120px] left-[-80px] w-[340px] h-[340px] rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-80px] right-[-60px] w-[260px] h-[260px] rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }} />

      <div className="w-full max-w-[390px] fade-in">
        {/* Brand */}
        <div className="flex flex-col items-center mb-9">
          <UnisphereWordmark iconSize={28} showSubtitle />
        </div>

        {/* Card */}
        <div
          className="rounded-4xl p-6 mb-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.045) 100%)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(28px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-white tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              Welcome back
            </h2>
            <p className="text-[12px] text-white/35 mt-0.5">Sign in to your student account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-3.5">
              {/* Email */}
              <div>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
                    placeholder="university@srmist.edu.in"
                    className={inputBase}
                    style={inputStyle(fieldErrors.email)}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                    <AlertCircle size={11} className="text-rose-400 flex-shrink-0" />
                    <p className="text-[11px] text-rose-400">{fieldErrors.email}</p>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                    placeholder="Password"
                    className={`${inputBase} pr-11`}
                    style={inputStyle(fieldErrors.password)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                    <AlertCircle size={11} className="text-rose-400 flex-shrink-0" />
                    <p className="text-[11px] text-rose-400">{fieldErrors.password}</p>
                  </div>
                )}
              </div>

              {/* Global error */}
              {error && (
                <div
                  className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
                  style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
                >
                  <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-rose-300">{error}</p>
                </div>
              )}

              {/* Forgot */}
              <div className="text-right -mt-1">
                <button
                  type="button"
                  className="text-[12px] font-semibold text-primary-400 active:opacity-60 transition-opacity"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-60 disabled:scale-100 mt-1"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: isLoading ? 'none' : '0 6px 20px rgba(99,102,241,0.4)',
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Signup link */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[13px] text-white/30">Don't have an account?</span>
          <button
            onClick={onGoSignup}
            className="text-[13px] font-bold text-primary-400 active:opacity-60 transition-opacity"
          >
            Create Account
          </button>
        </div>

        {/* Hint */}
        <p className="text-center text-[11px] text-white/18 mt-8">
          Only @srmist.edu.in email addresses are allowed
        </p>
      </div>
    </div>
  );
}
