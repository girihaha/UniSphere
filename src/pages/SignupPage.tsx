import { useState, FormEvent } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Hash,
  ChevronDown,
  ArrowLeft,
  Loader2,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { SignupPayload as SignupData } from '../types';
import logo from '../assets/UniSphere.jpeg';

interface SignupPageProps {
  onGoLogin: () => void;
}

const BRANCHES = [
  'Computer Science & Engineering',
  'Data Science',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Information Technology',
  'Biotechnology',
  'Chemical Engineering',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

type SignupView = 'form' | 'otp';

export default function SignupPage({ onGoLogin }: SignupPageProps) {
  const { signup, verifySignupOtp, resendSignupOtp } = useAuth();

  const [view, setView] = useState<SignupView>('form');

  const [form, setForm] = useState<SignupData>({
    name: '',
    regNumber: '',
    email: '',
    branch: '',
    year: '',
    password: '',
    role: 'student',
  });

  const [signupEmail, setSignupEmail] = useState('');
  const [otp, setOtp] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SignupData | 'otp', string>>
  >({});

  const set = (key: keyof SignupData, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    setFieldErrors((p) => ({ ...p, [key]: undefined }));
    setError('');
    setSuccessMessage('');
  };

  const validateSignupForm = () => {
    const errs: Partial<Record<keyof SignupData, string>> = {};

    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.regNumber.trim()) errs.regNumber = 'Registration number is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!form.email.trim().toLowerCase().endsWith('@srmist.edu.in')) {
      errs.email = 'Please use your university email (@srmist.edu.in).';
    }
    if (!form.branch) errs.branch = 'Please select your branch.';
    if (!form.year) errs.year = 'Please select your year.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';

    return errs;
  };

  const validateOtp = () => {
    const errs: Partial<Record<'otp', string>> = {};

    if (!otp.trim()) errs.otp = 'OTP is required.';
    else if (otp.trim().length !== 6) errs.otp = 'Enter the 6-digit OTP.';

    return errs;
  };

  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setSuccessMessage('');

    const errs = validateSignupForm();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const cleanedEmail = form.email.trim().toLowerCase();

      const result = await signup({
        name: form.name.trim(),
        regNumber: form.regNumber.trim(),
        email: cleanedEmail,
        branch: form.branch,
        year: form.year,
        password: form.password,
        role: 'student',
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.requiresOtp) {
        setSignupEmail(result.email || cleanedEmail);
        setOtp('');
        setView('otp');
        setSuccessMessage(result.message || 'OTP sent successfully.');
        return;
      }

      setSuccessMessage(result.message || 'Signup completed successfully.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setSuccessMessage('');

    const errs = validateOtp();
    if (Object.keys(errs).length) {
      setFieldErrors((prev) => ({ ...prev, ...errs }));
      return;
    }

    setFieldErrors((prev) => ({ ...prev, otp: undefined }));
    setSubmitting(true);

    try {
      const result = await verifySignupOtp(signupEmail.trim().toLowerCase(), otp.trim());

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccessMessage(result.message || 'Signup verified successfully.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMessage('');

    if (!signupEmail.trim()) {
      setError('Signup email missing. Please sign up again.');
      setView('form');
      return;
    }

    setResendingOtp(true);

    try {
      const result = await resendSignupOtp(signupEmail.trim().toLowerCase());

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccessMessage(result.message || 'OTP resent successfully.');
    } finally {
      setResendingOtp(false);
    }
  };

  const inputBase = `
    w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-medium text-white
    placeholder-white/25 outline-none transition-all duration-200
  `;

  const inputStyle = (hasError?: string) => ({
    background: 'rgba(255,255,255,0.055)',
    border: `1px solid ${hasError ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.1)'}`,
  });

  function FieldError({ msg }: { msg?: string }) {
    if (!msg) return null;

    return (
      <div className="flex items-center gap-1.5 mt-1.5 ml-1">
        <AlertCircle size={11} className="text-rose-400 flex-shrink-0" />
        <p className="text-[11px] text-rose-400">{msg}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-5 py-10 relative overflow-hidden gradient-bg">
      <div
        className="absolute top-[-100px] right-[-80px] w-[300px] h-[300px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-60px] left-[-60px] w-[240px] h-[240px] rounded-full opacity-12 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-[390px] fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              if (view === 'otp') {
                setView('form');
                setError('');
                setSuccessMessage('');
                return;
              }
              onGoLogin();
            }}
            className="p-2.5 rounded-2xl text-white/50 hover:text-white transition-colors active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <ArrowLeft size={17} />
          </button>
          <img
            src={logo}
            alt="UniSphere Logo"
            className="w-9 h-9 object-contain rounded-xl mt-[2px]"
          />
        </div>

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
              {view === 'form' ? 'Create account' : 'Verify signup OTP'}
            </h2>
            <p className="text-[12px] text-white/35 mt-0.5">
              {view === 'form'
                ? 'Join your university network'
                : 'Enter the 6-digit OTP sent to your university email'}
            </p>
          </div>

          {view === 'form' ? (
            <form onSubmit={handleSignupSubmit} noValidate>
              <div className="flex flex-col gap-3.5">
                <div
                  className="flex items-start gap-2.5 rounded-2xl px-4 py-3"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.18)',
                  }}
                >
                  <GraduationCap size={14} className="text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-primary-300 mb-0.5">Student signup only</p>
                    <p className="text-[11px] text-primary-200/65">
                      Club admin and super admin accounts are created separately by the platform team.
                    </p>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder="Full Name"
                      className={inputBase}
                      style={inputStyle(fieldErrors.name)}
                      autoComplete="name"
                    />
                  </div>
                  <FieldError msg={fieldErrors.name} />
                </div>

                <div>
                  <div className="relative">
                    <Hash
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={form.regNumber}
                      onChange={(e) => set('regNumber', e.target.value)}
                      placeholder="Registration Number (e.g. RA2211023...)"
                      className={inputBase}
                      style={inputStyle(fieldErrors.regNumber)}
                      autoComplete="off"
                    />
                  </div>
                  <FieldError msg={fieldErrors.regNumber} />
                </div>

                <div>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="university@srmist.edu.in"
                      className={inputBase}
                      style={inputStyle(fieldErrors.email)}
                      autoComplete="email"
                    />
                  </div>
                  <FieldError msg={fieldErrors.email} />
                </div>

                <div>
                  <div className="relative">
                    <GraduationCap
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <select
                      value={form.branch}
                      onChange={(e) => set('branch', e.target.value)}
                      className={`${inputBase} appearance-none pr-9`}
                      style={inputStyle(fieldErrors.branch)}
                    >
                      <option value="" style={{ background: '#0a0e1a' }}>
                        Select Branch
                      </option>
                      {BRANCHES.map((b) => (
                        <option key={b} value={b} style={{ background: '#0a0e1a' }}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                  </div>
                  <FieldError msg={fieldErrors.branch} />
                </div>

                <div>
                  <div className="relative">
                    <GraduationCap
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <select
                      value={form.year}
                      onChange={(e) => set('year', e.target.value)}
                      className={`${inputBase} appearance-none pr-9`}
                      style={inputStyle(fieldErrors.year)}
                    >
                      <option value="" style={{ background: '#0a0e1a' }}>
                        Select Year
                      </option>
                      {YEARS.map((y) => (
                        <option key={y} value={y} style={{ background: '#0a0e1a' }}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                  </div>
                  <FieldError msg={fieldErrors.year} />
                </div>

                <div>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => set('password', e.target.value)}
                      placeholder="Password (min 6 characters)"
                      className={`${inputBase} pr-11`}
                      style={inputStyle(fieldErrors.password)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <FieldError msg={fieldErrors.password} />
                </div>

                {error && (
                  <div
                    className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
                    style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
                  >
                    <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-rose-300">{error}</p>
                  </div>
                )}

                {successMessage && (
                  <div
                    className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-emerald-300">{successMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-60 disabled:scale-100 mt-1"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: submitting ? 'none' : '0 6px 20px rgba(99,102,241,0.4)',
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} noValidate>
              <div className="flex flex-col gap-3.5">
                <div
                  className="flex items-start gap-2.5 rounded-2xl px-4 py-3"
                  style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.18)',
                  }}
                >
                  <ShieldCheck size={14} className="text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-primary-300 mb-0.5">OTP sent</p>
                    <p className="text-[11px] text-primary-200/65 break-all">
                      We sent a 6-digit OTP to{' '}
                      <span className="font-semibold text-primary-200">{signupEmail}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Hash
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setFieldErrors((prev) => ({ ...prev, otp: undefined }));
                        setError('');
                        setSuccessMessage('');
                      }}
                      placeholder="Enter 6-digit OTP"
                      className={inputBase}
                      style={inputStyle(fieldErrors.otp)}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </div>
                  <FieldError msg={fieldErrors.otp} />
                </div>

                {error && (
                  <div
                    className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
                    style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}
                  >
                    <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-rose-300">{error}</p>
                  </div>
                )}

                {successMessage && (
                  <div
                    className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-emerald-300">{successMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-bold text-white transition-all active:scale-[0.97] disabled:opacity-60 disabled:scale-100 mt-1"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: submitting ? 'none' : '0 6px 20px rgba(99,102,241,0.4)',
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying OTP...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendingOtp}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white/75 transition-all active:scale-[0.97] disabled:opacity-60"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {resendingOtp ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Resending OTP...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={15} />
                      Resend OTP
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[13px] text-white/30">
            {view === 'form' ? 'Already have an account?' : 'Back to login?'}
          </span>
          <button
            type="button"
            onClick={onGoLogin}
            className="text-[13px] font-bold text-primary-400 active:opacity-60 transition-opacity"
          >
            Sign In
          </button>
        </div>

        <p className="text-center text-[11px] text-white/18 mt-6">
          Only @srmist.edu.in email addresses are allowed
        </p>
      </div>
    </div>
  );
}
