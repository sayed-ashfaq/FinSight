import { useState } from 'react';
import { LayoutDashboard, FileUp, Settings, Wallet } from 'lucide-react';
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
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-50 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-slate-800 flex flex-col relative z-20">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">FinSight</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === 'upload' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <FileUp className="w-5 h-5" />
            <span className="font-medium">Upload Bank Statement</span>
          </button>
          
          <button 
            onClick={() => {
              if (transactions) setActiveTab('dashboard');
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${!transactions ? 'opacity-50 cursor-not-allowed' : ''} ${activeTab === 'dashboard' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
            {!transactions && <span className="ml-auto text-[10px] uppercase tracking-wider bg-slate-800 text-slate-500 px-2 py-1 rounded">Locked</span>}
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800/50 mt-auto">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors">
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"></div>
        
        <div className="relative h-full overflow-y-auto w-full p-8 scroll-smooth">
          {activeTab === 'upload' && (
            <div className="max-w-4xl mx-auto mt-12">
              <div className="mb-10 text-center animate-in fade-in duration-700">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 brand-gradient-text">Unlock Your Finances</h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">Upload your Kotak bank statement to instantly visualize your spending habits, income flows, and financial health.</p>
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
