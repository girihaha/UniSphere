import { useState, FormEvent } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Hash,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/UniSphere.jpeg';

interface LoginPageProps {
  onGoSignup: () => void;
}

type ViewMode = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-reset';

export default function LoginPage({ onGoSignup }: LoginPageProps) {
  const {
    login,
    requestForgotPasswordOtp,
    verifyForgotPasswordOtp,
    resetPasswordWithOtp,
  } = useAuth();

  const [view, setView] = useState<ViewMode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    forgotEmail?: string;
    forgotOtp?: string;
    newPassword?: string;
  }>({});

  const resetMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const openForgotPassword = () => {
    resetMessages();
    setFieldErrors({});
    setForgotEmail(email.trim().toLowerCase());
    setForgotOtp('');
    setNewPassword('');
    setView('forgot-email');
  };

  const isValidUniversityEmail = (value: string) =>
    value.trim().toLowerCase().endsWith('@srmist.edu.in');

  const validateLogin = () => {
    const errs: { email?: string; password?: string } = {};

    if (!email.trim()) errs.email = 'Email is required.';
    else if (!isValidUniversityEmail(email)) {
      errs.email = 'Please use your university email (@srmist.edu.in).';
    }

    if (!password) errs.password = 'Password is required.';

    return errs;
  };

  const validateForgotEmail = () => {
    const errs: { forgotEmail?: string } = {};

    if (!forgotEmail.trim()) errs.forgotEmail = 'Email is required.';
    else if (!isValidUniversityEmail(forgotEmail)) {
      errs.forgotEmail = 'Please use your university email (@srmist.edu.in).';
    }

    return errs;
  };

  const validateForgotOtp = () => {
    const errs: { forgotOtp?: string } = {};

    if (!forgotOtp.trim()) errs.forgotOtp = 'OTP is required.';
    else if (forgotOtp.trim().length !== 6) errs.forgotOtp = 'Enter the 6-digit OTP.';

    return errs;
  };

  const validateResetPassword = () => {
    const errs: { forgotOtp?: string; newPassword?: string } = {};

    if (!forgotOtp.trim()) errs.forgotOtp = 'OTP is required.';
    else if (forgotOtp.trim().length !== 6) errs.forgotOtp = 'Enter the 6-digit OTP.';

    if (!newPassword) errs.newPassword = 'New password is required.';
    else if (newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters.';

    return errs;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();

    const errs = validateLogin();
    if (Object.keys(errs).length) {
      setFieldErrors((prev) => ({ ...prev, ...errs }));
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const result = await login(email.trim(), password);
      if (result.error) {
        setError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();

    const errs = validateForgotEmail();
    if (Object.keys(errs).length) {
      setFieldErrors((prev) => ({ ...prev, ...errs }));
      return;
    }

    setFieldErrors((prev) => ({ ...prev, forgotEmail: undefined }));
    setSubmitting(true);

    try {
      const cleanedEmail = forgotEmail.trim().toLowerCase();
      const result = await requestForgotPasswordOtp(cleanedEmail);

      if (result.error) {
        setError(result.error);
        return;
      }

      setForgotEmail(cleanedEmail);
      setView('forgot-otp');
      setSuccessMessage(result.message || 'OTP sent successfully.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();

    const errs = validateForgotOtp();
    if (Object.keys(errs).length) {
      setFieldErrors((prev) => ({ ...prev, ...errs }));
      return;
    }

    setFieldErrors((prev) => ({ ...prev, forgotOtp: undefined }));
    setSubmitting(true);

    try {
      const result = await verifyForgotPasswordOtp(
        forgotEmail.trim().toLowerCase(),
        forgotOtp.trim()
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      setView('forgot-reset');
      setSuccessMessage(result.message || 'OTP verified successfully.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    resetMessages();

    const errs = validateResetPassword();
    if (Object.keys(errs).length) {
      setFieldErrors((prev) => ({ ...prev, ...errs }));
      return;
    }

    setFieldErrors((prev) => ({
      ...prev,
      forgotOtp: undefined,
      newPassword: undefined,
    }));
    setSubmitting(true);

    try {
      const result = await resetPasswordWithOtp(
        forgotEmail.trim().toLowerCase(),
        forgotOtp.trim(),
        newPassword
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccessMessage(result.message || 'Password reset successfully.');
      setView('login');
      setPassword('');
      setNewPassword('');
      setForgotOtp('');
      setForgotEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendForgotOtp = async () => {
    resetMessages();

    if (!forgotEmail.trim()) {
      setError('Email missing. Please start again.');
      setView('forgot-email');
      return;
    }

    setResendingOtp(true);

    try {
      const result = await requestForgotPasswordOtp(forgotEmail.trim().toLowerCase());

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

  const renderFieldError = (msg?: string) => {
    if (!msg) return null;

    return (
      <div className="flex items-center gap-1.5 mt-1.5 ml-1">
        <AlertCircle size={11} className="text-rose-400 flex-shrink-0" />
        <p className="text-[11px] text-rose-400">{msg}</p>
      </div>
    );
  };

  const renderMessageBox = () => (
    <>
      {error && (
        <div
          className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
          style={{
            background: 'rgba(244,63,94,0.08)',
            border: '1px solid rgba(244,63,94,0.2)',
          }}
        >
          <AlertCircle size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-rose-300">{error}</p>
        </div>
      )}

      {successMessage && (
        <div
          className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}
        >
          <ShieldCheck size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-emerald-300">{successMessage}</p>
        </div>
      )}
    </>
  );

  const renderHeaderText = () => {
    if (view === 'forgot-email') {
      return {
        title: 'Forgot password',
        subtitle: 'We’ll send an OTP to your university email',
      };
    }

    if (view === 'forgot-otp') {
      return {
        title: 'Verify OTP',
        subtitle: 'Enter the 6-digit OTP sent to your email',
      };
    }

    if (view === 'forgot-reset') {
      return {
        title: 'Reset password',
        subtitle: 'Set a new password for your account',
      };
    }

    return {
      title: 'Welcome back',
      subtitle: 'Sign in to your UniSphere account',
    };
  };

  const headerText = renderHeaderText();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden gradient-bg">
      <div
        className="absolute top-[-120px] left-[-80px] w-[340px] h-[340px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-80px] right-[-60px] w-[260px] h-[260px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #22d3ee 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-[390px] fade-in relative z-10">
        <div className="flex flex-col items-center mb-9 relative">
          {view !== 'login' && (
            <button
              type="button"
              onClick={() => {
                resetMessages();
                if (view === 'forgot-reset') {
                  setView('forgot-otp');
                  return;
                }
                if (view === 'forgot-otp') {
                  setView('forgot-email');
                  return;
                }
                setView('login');
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2.5 rounded-2xl text-white/50 hover:text-white transition-colors active:scale-95"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <ArrowLeft size={17} />
            </button>
          )}

          <img
            src={logo}
            alt="UniSphere Logo"
            className="w-20 h-20 mb-4 object-cover rounded-2xl"
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
            <h2
              className="text-xl font-extrabold text-white tracking-tight"
              style={{ letterSpacing: '-0.03em' }}
            >
              {headerText.title}
            </h2>
            <p className="text-[12px] text-white/35 mt-0.5">{headerText.subtitle}</p>
          </div>

          {view === 'login' && (
            <form onSubmit={handleSubmit} noValidate>
              <div className="flex flex-col gap-3.5">
                <div>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setFieldErrors((p) => ({ ...p, email: undefined }));
                        resetMessages();
                      }}
                      placeholder="university@srmist.edu.in"
                      className={inputBase}
                      style={inputStyle(fieldErrors.email)}
                      autoComplete="email"
                    />
                  </div>
                  {renderFieldError(fieldErrors.email)}
                </div>

                <div>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors((p) => ({ ...p, password: undefined }));
                        resetMessages();
                      }}
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
                  {renderFieldError(fieldErrors.password)}
                </div>

                {renderMessageBox()}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="relative z-20 inline-flex text-[12px] font-semibold text-primary-400 hover:text-primary-300 active:opacity-60 transition-opacity cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

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
          )}

          {view === 'forgot-email' && (
            <form onSubmit={handleRequestOtp} noValidate>
              <div className="flex flex-col gap-3.5">
                <div>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        setFieldErrors((p) => ({ ...p, forgotEmail: undefined }));
                        resetMessages();
                      }}
                      placeholder="university@srmist.edu.in"
                      className={inputBase}
                      style={inputStyle(fieldErrors.forgotEmail)}
                      autoComplete="email"
                    />
                  </div>
                  {renderFieldError(fieldErrors.forgotEmail)}
                </div>

                {renderMessageBox()}

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
                    'Send OTP'
                  )}
                </button>
              </div>
            </form>
          )}

          {view === 'forgot-otp' && (
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
                      <span className="font-semibold text-primary-200">{forgotEmail}</span>
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
                      value={forgotOtp}
                      onChange={(e) => {
                        setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setFieldErrors((p) => ({ ...p, forgotOtp: undefined }));
                        resetMessages();
                      }}
                      placeholder="Enter 6-digit OTP"
                      className={inputBase}
                      style={inputStyle(fieldErrors.forgotOtp)}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </div>
                  {renderFieldError(fieldErrors.forgotOtp)}
                </div>

                {renderMessageBox()}

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
                  onClick={handleResendForgotOtp}
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

          {view === 'forgot-reset' && (
            <form onSubmit={handleResetPassword} noValidate>
              <div className="flex flex-col gap-3.5">
                <div>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setFieldErrors((p) => ({ ...p, newPassword: undefined }));
                        resetMessages();
                      }}
                      placeholder="New password"
                      className={`${inputBase} pr-11`}
                      style={inputStyle(fieldErrors.newPassword)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {renderFieldError(fieldErrors.newPassword)}
                </div>

                <div>
                  <div className="relative">
                    <Hash
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => {
                        setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                        setFieldErrors((p) => ({ ...p, forgotOtp: undefined }));
                        resetMessages();
                      }}
                      placeholder="OTP"
                      className={inputBase}
                      style={inputStyle(fieldErrors.forgotOtp)}
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </div>
                  {renderFieldError(fieldErrors.forgotOtp)}
                </div>

                {renderMessageBox()}

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
                      Resetting password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[13px] text-white/30">Don't have an account?</span>
          <button
            type="button"
            onClick={onGoSignup}
            className="text-[13px] font-bold text-primary-400 active:opacity-60 transition-opacity"
          >
            Create Account
          </button>
        </div>

        <p className="text-center text-[11px] text-white/18 mt-8">
          Only @srmist.edu.in email addresses are allowed
        </p>
      </div>
    </div>
  );
}
