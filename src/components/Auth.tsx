import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Shield, Globe, X } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'verify';

const APP_LOGO = '/1775218881775-3ee13392-9669-4d24-ae5f-9ac05cae51cf.png';

const features = [
  { icon: Zap,    label: 'Real-time AI web search' },
  { icon: Shield, label: 'Secure & private conversations' },
  { icon: Globe,  label: 'Multilingual responses' },
];

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, verifyOtp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (mode === 'verify') {
        await verifyOtp(email, otp);
      } else if (mode === 'signup') {
        const { needsVerification } = await signUp(email, password);
        if (needsVerification) {
          setNotice('Check your email for a confirmation link or verification code.');
          setMode('verify');
        }
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('provider') || msg.toLowerCase().includes('not enabled') || msg.toLowerCase().includes('validation_failed')) {
        setError('Google sign-in is not yet enabled. Please go to your Supabase dashboard → Authentication → Providers → Google and enable it.');
      } else {
        setError(msg || 'Google sign-in failed. Please try again.');
      }
      setGoogleLoading(false);
    }
  };

  const switchMode = (m: AuthMode) => {
    setError('');
    setNotice('');
    setPassword('');
    setOtp('');
    setMode(m);
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-gray-950" style={{ minHeight: '100dvh' }}>
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob blob-1" style={{ top: '5%', left: '2%' }} />
        <div className="blob blob-2" style={{ bottom: '5%', right: '2%' }} />
      </div>

      {/* ── Left panel: form ── */}
      <div className="relative z-10 flex flex-col justify-center w-full lg:w-[48%] px-6 py-10 sm:px-10 xl:px-16 overflow-y-auto themed-scroll">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden">
              <img src={APP_LOGO} alt="ITA AI" className="w-7 h-7" />
            </div>
            <span className="text-2xl font-black tracking-wide gradient-text-animated">ITA AI</span>
          </div>
          <p className="text-gray-500 text-sm mt-1.5">Your intelligent search companion</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-7 w-full max-w-md animate-scale-in">

          {mode === 'verify' ? (
            <>
              <div className="mb-5">
                <div className="w-11 h-11 bg-blue-500/15 rounded-xl flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Verify your email</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Enter the code sent to <span className="text-blue-400 font-medium">{email}</span>
                </p>
              </div>

              {notice && (
                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/40 rounded-xl text-blue-300 text-sm animate-slide-up">
                  {notice}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-xl text-white text-center text-2xl tracking-[0.6em] placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
                {error && <ErrorBanner msg={error} onDismiss={() => setError('')} />}
                <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {loading ? <Spinner /> : <>Verify <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button type="button" onClick={() => switchMode('signup')} className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  ← Back to sign up
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">
                  {mode === 'signin' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  {mode === 'signin' ? 'Sign in to your ITA AI account' : 'Start your AI-powered journey'}
                </p>
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                className="btn-primary w-full flex items-center justify-center gap-3 py-2.5 bg-gray-800/70 hover:bg-gray-700/70 border border-gray-700 hover:border-gray-500 rounded-xl text-white text-sm font-medium transition-all mb-4 disabled:opacity-50"
              >
                {googleLoading ? <Spinner small /> : (
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {mode === 'signin' ? 'Continue with Google' : 'Sign up with Google'}
              </button>

              <div className="relative flex items-center mb-4">
                <div className="flex-1 border-t border-gray-800" />
                <span className="px-3 text-xs text-gray-600 uppercase tracking-wider">or</span>
                <div className="flex-1 border-t border-gray-800" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-800/70 border border-gray-700 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                </div>
                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-800/70 border border-gray-700 rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && <ErrorBanner msg={error} onDismiss={() => setError('')} />}

                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20 text-sm mt-1">
                  {loading ? <Spinner /> : <>{mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>}
                </button>

                <p className="text-center text-sm text-gray-500 pt-1">
                  {mode === 'signin' ? (
                    <>Don't have an account?{' '}
                      <button type="button" onClick={() => switchMode('signup')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors underline underline-offset-2">
                        Create Account
                      </button>
                    </>
                  ) : (
                    <>Already have an account?{' '}
                      <button type="button" onClick={() => switchMode('signin')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors underline underline-offset-2">
                        Sign In
                      </button>
                    </>
                  )}
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── Right panel: branding ── */}
      <div className="hidden lg:flex relative w-[52%] flex-col justify-center items-center overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-gray-950 to-purple-950/60" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse at 60% 40%, rgba(59,130,246,0.18) 0%, transparent 60%),
                              radial-gradient(ellipse at 30% 70%, rgba(6,182,212,0.12) 0%, transparent 50%),
                              radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.10) 0%, transparent 50%)`,
          }}
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        {/* Blur overlay at edges */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-gray-950/30" />

        {/* Content */}
        <div className="relative z-10 text-center px-12 max-w-lg animate-slide-up">
          {/* Large logo */}
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-3xl mb-8 shadow-2xl shadow-blue-500/20 animate-pulse-glow border border-blue-500/20 backdrop-blur-sm">
            <img src={APP_LOGO} alt="ITA AI" className="w-16 h-16" />
          </div>

          <h1 className="text-5xl font-black tracking-wide mb-3 gradient-text-animated">ITA AI</h1>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            Search smarter. Think deeper.<br />Get answers instantly.
          </p>

          <div className="space-y-3 text-left">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4 glass rounded-xl px-5 py-3.5">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-gray-300 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs text-gray-700">Powered by Groq · Llama 3.1 · SerpAPI</p>
        </div>
      </div>
    </div>
  );
}

function Spinner({ small }: { small?: boolean }) {
  const s = small ? 'w-4 h-4' : 'w-5 h-5';
  return <span className={`${s} border-2 border-white/30 border-t-white rounded-full animate-spin`} />;
}

function ErrorBanner({ msg, onDismiss }: { msg: string; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-2.5 p-3 bg-red-900/20 border border-red-700/40 rounded-xl text-red-300 text-sm animate-slide-up">
      <span className="flex-1 leading-snug">{msg}</span>
      <button onClick={onDismiss} className="flex-shrink-0 mt-0.5 text-red-500 hover:text-red-300 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
