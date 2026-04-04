import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'verify';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, verifyOtp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'verify') {
        await verifyOtp(email, otp);
      } else if (mode === 'signup') {
        const { needsVerification } = await signUp(email, password);
        if (needsVerification) setMode('verify');
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
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
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      setGoogleLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setError('');
    setPassword('');
    setOtp('');
    setMode(newMode);
  };

  const features = [
    { icon: Zap, text: 'Real-time AI-powered web search' },
    { icon: Shield, text: 'Secure & private conversations' },
    { icon: Globe, text: 'Multilingual responses' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex overflow-hidden">
      {/* Animated blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1" style={{ top: '10%', left: '5%' }} />
        <div className="blob blob-2" style={{ bottom: '10%', right: '5%' }} />
        <div className="blob blob-3" style={{ top: '50%', left: '50%' }} />
      </div>

      {/* Left — Form panel */}
      <div className="relative z-10 flex flex-col justify-center w-full lg:w-1/2 px-6 py-12 sm:px-12 xl:px-20 animate-fade-in">
        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text-animated">Ita AI</span>
          </div>
          <p className="text-gray-500 text-sm mt-2">Your intelligent search companion</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 w-full max-w-md animate-scale-in">
          {mode === 'verify' ? (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Check your email</h2>
                <p className="text-gray-400 text-sm mt-1">
                  We sent a 6-digit code to <span className="text-blue-400 font-medium">{email}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-sm animate-slide-up">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading || otp.length < 6} className="btn-primary w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify Email <ArrowRight className="w-4 h-4" /></>}
                </button>

                <button type="button" onClick={() => switchMode('signup')} className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  ← Back to sign up
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'signin' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {mode === 'signin' ? 'Sign in to your Ita AI account' : 'Start your AI-powered journey'}
                </p>
              </div>

              {/* Google button */}
              <button
                onClick={handleGoogle}
                disabled={googleLoading}
                className="btn-primary w-full flex items-center justify-center gap-3 py-3 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 hover:border-gray-500 rounded-xl text-white font-medium transition-all mb-5 disabled:opacity-50"
              >
                {googleLoading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
              </button>

              <div className="relative flex items-center mb-5">
                <div className="flex-1 border-t border-gray-700/60" />
                <span className="px-3 text-xs text-gray-500 uppercase tracking-wider">or</span>
                <div className="flex-1 border-t border-gray-700/60" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 bg-gray-800/60 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-sm animate-slide-up">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <>{mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-4 h-4" /></>
                  }
                </button>

                <div className="pt-2 text-center">
                  {mode === 'signin' ? (
                    <button type="button" onClick={() => switchMode('signup')} className="text-sm text-gray-400 hover:text-white transition-colors group">
                      Don't have an account?{' '}
                      <span className="text-blue-400 group-hover:text-blue-300 font-medium underline underline-offset-2">Create Account</span>
                    </button>
                  ) : (
                    <button type="button" onClick={() => switchMode('signin')} className="text-sm text-gray-400 hover:text-white transition-colors group">
                      Already have an account?{' '}
                      <span className="text-blue-400 group-hover:text-blue-300 font-medium underline underline-offset-2">Sign In</span>
                    </button>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Right — Branding panel (hidden on mobile) */}
      <div className="hidden lg:flex relative w-1/2 flex-col justify-center items-center px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-600/10 to-purple-600/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15)_0%,_transparent_70%)]" />

        <div className="relative z-10 text-center max-w-md animate-slide-up">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-8 shadow-2xl shadow-blue-500/40 animate-pulse-glow">
            <Sparkles className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-5xl font-black gradient-text-animated mb-4 leading-tight">
            Ita AI
          </h1>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Search smarter. Think deeper. Get answers instantly.
          </p>

          <div className="space-y-4 text-left">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-4 glass rounded-xl px-5 py-4">
                <div className="w-9 h-9 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-gray-300 text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          <p className="mt-10 text-xs text-gray-600">
            Powered by Groq · Llama 3.1 · SerpAPI
          </p>
        </div>
      </div>
    </div>
  );
}
