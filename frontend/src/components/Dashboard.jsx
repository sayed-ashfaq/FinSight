import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign } from 'lucide-react';

export default function Dashboard({ transactions }) {
  
  const metrics = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(t => {
      if (t.type === 'credit') totalIncome += t.amount;
      else totalExpenses += Math.abs(t.amount);
    });
    
    return {
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      transactionCount: transactions.length
    };
  }, [transactions]);
  
  const chartData = useMemo(() => {
    // Group transactions by date
    const grouped = transactions.reduce((acc, t) => {
      const date = t.date;
      if (!acc[date]) acc[date] = { date, income: 0, expense: 0, balance: t.balance };
      if (t.type === 'credit') acc[date].income += t.amount;
      else acc[date].expense += Math.abs(t.amount);
      return acc;
    }, {});
    
    // Convert to sorted array
    return Object.values(grouped).sort();
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Financial Overview</h1>
        <p className="text-slate-400 mt-1">Found {metrics.transactionCount} transactions in your statement.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowUpRight className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-slate-400 font-medium text-sm">Total Income</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-emerald-400">{formatCurrency(metrics.totalIncome)}</span>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-rose-500/30 transition-colors duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ArrowDownRight className="w-16 h-16 text-rose-500" />
          </div>
          <p className="text-slate-400 font-medium text-sm">Total Expenses</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-rose-400">{formatCurrency(metrics.totalExpenses)}</span>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-colors duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-slate-400 font-medium text-sm">Net Flow</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-bold ${metrics.netSavings >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              {formatCurrency(metrics.netSavings)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
          <h2 className="text-lg font-medium text-slate-200 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Cash Flow Trend
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-center">
            <h2 className="text-lg font-medium text-slate-200 mb-6">Income vs Expense</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: 'Flow', income: metrics.totalIncome, expense: metrics.totalExpenses}]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>
      
      {/* Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-white/5 bg-slate-900/40">
          <h2 className="text-lg font-medium text-slate-200">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/5">
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ref No.</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.slice(0, 100).map((t, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{t.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-300 max-w-sm" title={t.description}>
                    <div className="truncate">{t.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{t.ref_no}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${t.type === 'credit' ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {t.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 text-right">{formatCurrency(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
