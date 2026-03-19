import { useState } from 'react';
import { LayoutDashboard, FileUp, Wallet } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';

function App() {
  const [transactions, setTransactions] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');

  const handleUploadSuccess = (data) => {
    setTransactions(data.transactions);
    setActiveTab('dashboard');
  };

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
          
          <nav className="flex items-center space-x-1">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'upload' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <FileUp className="w-4 h-4 mr-2" />
              Upload
            </button>
            <button 
              onClick={() => { if (transactions) setActiveTab('dashboard'); }}
              disabled={!transactions}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${!transactions ? 'opacity-40 cursor-not-allowed hidden md:flex' : activeTab === 'dashboard' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            
            {!transactions && (
              <div className="ml-4 pl-4 border-l border-slate-800 hidden md:flex items-center select-none">
                <span className="text-xs text-slate-500 font-medium tracking-wider uppercase mr-3">Awaiting Data</span>
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
              </div>
            )}
            {transactions && (
              <div className="ml-4 pl-4 border-l border-slate-800 hidden md:flex items-center select-none">
                 <span className="text-xs text-emerald-400 font-medium tracking-wider uppercase mr-3">Live Mode</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {activeTab === 'upload' && (
            <div className="max-w-4xl mx-auto mt-6 md:mt-12">
              <div className="mb-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse"></span>
                  Privacy First: Local Processing
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 brand-gradient-text">Unlock Your Finances</h1>
                <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">Upload your Kotak bank statement to instantly visualize your spending habits, income flows, and financial health.</p>
              </div>
              <FileUpload onSuccess={handleUploadSuccess} />
            </div>
          )}
          
          {activeTab === 'dashboard' && transactions && (
            <Dashboard transactions={transactions} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
