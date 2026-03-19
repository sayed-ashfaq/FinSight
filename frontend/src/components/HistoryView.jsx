import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { History, FileText, ChevronRight, Loader2, Calendar } from 'lucide-react';

export default function HistoryView({ onSelect }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        let token = 'local.mock.token';
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.access_token) token = data.session.access_token;
        }

        const res = await axios.get('http://localhost:8000/api/statements/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        setError('Failed to fetch history details.');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center animate-pulse">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400">Loading your secure statement history...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 max-w-5xl mx-auto mt-6 md:mt-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80 shadow-lg">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
            <History className="w-8 h-8 mr-3 text-indigo-400" />
            Statement History
          </h1>
          <p className="text-slate-400 mt-2">View and reload previously parsed statements instantly.</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {history.length === 0 && !error ? (
        <div className="glass-panel text-center py-20 rounded-2xl">
            <FileText className="w-16 h-16 mx-auto text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-300">No History Found</h3>
            <p className="text-slate-500 mt-2">You haven't uploaded any bank statements yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map((stmt) => (
            <div 
              key={stmt.id} 
              onClick={() => onSelect(stmt.transactions)}
              className="glass-panel p-6 rounded-2xl hover:border-indigo-500/50 cursor-pointer group transition-all duration-300 hover:shadow-indigo-500/10 hover:shadow-xl relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-800/80 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-xs font-semibold px-2.5 py-1 bg-slate-800 rounded-full text-slate-300 flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(stmt.uploaded_at).toLocaleDateString()}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-200 mb-1 truncate" title={stmt.filename}>
                {stmt.filename}
              </h3>
              
              <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center text-sm">
                 <span className="text-slate-400 font-medium tracking-wide">
                   {stmt.transactions?.length || 0} Trx
                 </span>
                 <span className="text-indigo-400 flex items-center font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                   Load Data <ChevronRight className="w-4 h-4 ml-1" />
                 </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
