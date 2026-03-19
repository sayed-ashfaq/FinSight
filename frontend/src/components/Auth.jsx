import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Wallet, Mail, Key } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-50 relative overflow-hidden">
        <div className="max-w-md w-full glass-panel z-10 p-8 rounded-2xl border border-indigo-500/30 text-center shadow-2xl backdrop-blur-3xl">
            <h2 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-4">Local Sandbox Mode</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">Supabase is currently not configured in your environment. You can enter Sandbox mode to continue testing the features locally.</p>
            <button onClick={() => onLogin({ id: 'local-test-uuid', email: 'local@sandbox.com' })} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3.5 rounded-xl transition-colors border border-slate-700">
                Enter Developer Sandbox
            </button>
        </div>
      </div>
    );
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.user) onLogin(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.user) onLogin(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none z-0"></div>
        <div className="max-w-md w-full glass-panel z-10 p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl rotate-12 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Wallet className="w-10 h-10 text-white -rotate-12" />
            </div>
            
            <div className="mt-12 text-center mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">FinSight Auth</h1>
                <p className="text-slate-400 mt-2">Sign in to unlock your secure financial analytics.</p>
            </div>

            {error && <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm animate-in fade-in">{error}</div>}

            <form onSubmit={handleEmailAuth} className="space-y-4">
                <div className="relative">
                    <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
                <div className="relative">
                    <Key className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 flex justify-center items-center rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50">
                    {loading ? <span className="flex h-2 w-2 rounded-full bg-white mr-2 shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-ping"></span> : null}
                    {loading ? 'Authenticating...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </button>
            </form>

            <div className="mt-6 flex items-center justify-center space-x-4">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-slate-500 text-sm font-medium">Secondary Options</span>
                <div className="h-px bg-slate-800 flex-1"></div>
            </div>

            <button onClick={handleGoogleLogin} className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 transition-colors text-slate-300 font-medium group">
                <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                Continue with Google
            </button>

            <div className="mt-8 text-center">
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-slate-400 hover:text-white text-sm transition-colors font-medium">
                    {isSignUp ? 'Already have an account? Sign in' : "First time? Join FinSight"}
                </button>
            </div>
        </div>
    </div>
  );
}
