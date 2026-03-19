import { useState, useEffect } from 'react';
import { LayoutDashboard, FileUp, Wallet, Calendar, History, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import MonthlyView from './components/MonthlyView';
import Auth from './components/Auth';
import HistoryView from './components/HistoryView';

function App() {
  const [transactions, setTransactions] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) setUser(session.user);
      });
      
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
        }
      );
      
      return () => {
        authListener.subscription?.unsubscribe();
      };
    }
  }, []);

  const handleUploadSuccess = (data) => {
    setTransactions(data.transactions);
    setActiveTab('dashboard');
  };

  const handleHistorySelect = (historyTransactions) => {
    setTransactions(historyTransactions);
    setActiveTab('dashboard');
  };

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setTransactions(null);
    setActiveTab('upload');
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30 flex flex-col relative">
      <div className="fixed inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none z-0"></div>
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass border-b border-slate-800/60 backdrop-blur-xl bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('upload')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">FinSight</span>
          </div>
          
          <nav className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === 'upload' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <FileUp className="w-4 h-4 mr-2" />
              Upload
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeTab === 'history' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <History className="w-4 h-4 mr-2" />
              History
            </button>
            <div className="w-px h-6 bg-slate-800 mx-2 hidden md:block"></div>
            <button 
              onClick={() => { if (transactions) setActiveTab('dashboard'); }}
              disabled={!transactions}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${!transactions ? 'opacity-40 cursor-not-allowed hidden md:flex' : activeTab === 'dashboard' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </button>
            <button 
              onClick={() => { if (transactions) setActiveTab('monthly'); }}
              disabled={!transactions}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${!transactions ? 'opacity-40 cursor-not-allowed hidden md:flex' : activeTab === 'monthly' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Monthly
            </button>
            
            <div className="w-px h-6 bg-slate-800 mx-2"></div>
            <button onClick={handleSignOut} className="flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 whitespace-nowrap">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {activeTab === 'upload' && (
            <div className="max-w-4xl mx-auto mt-6 md:mt-12">
              <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                  Authenticated & Local Privacy
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 brand-gradient-text">Unlock Your Finances</h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">Upload a new Kotak bank statement to visualize flows, or pull one from your structured History.</p>
              </div>
              <FileUpload onSuccess={handleUploadSuccess} />
            </div>
          )}

          {activeTab === 'history' && (
             <HistoryView onSelect={handleHistorySelect} />
          )}
          
          {activeTab === 'dashboard' && transactions && (
            <Dashboard transactions={transactions} />
          )}
          
          {activeTab === 'monthly' && transactions && (
            <MonthlyView transactions={transactions} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
