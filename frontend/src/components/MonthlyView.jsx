import { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, PieChart as PieChartIcon, Calendar, ArrowRight, Activity, TrendingDown } from 'lucide-react';
import { CATEGORY_COLORS, categorizeTransaction, parseDateStrToObj, formatCurrency } from '../utils/finance';

export default function MonthlyView({ transactions }) {
  
  // 1. Enrich transactions and extract unique months
  const processed = useMemo(() => {
    const enriched = transactions.map(t => ({
      ...t,
      dateObj: parseDateStrToObj(t.date),
      category: categorizeTransaction(t.description, t.type)
    })).sort((a, b) => a.dateObj - b.dateObj);
    
    // Extract unique months like "Jul 2025"
    const monthsSet = new Set();
    enriched.forEach(t => {
      monthsSet.add(t.dateObj.toLocaleString('default', { month: 'short', year: 'numeric' }));
    });
    
    // Sort months correctly by taking the timestamp of the first occurrence
    const sortedMonths = Array.from(monthsSet).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
      return dateA - dateB;
    });

    return { enriched, sortedMonths };
  }, [transactions]);

  const { enriched, sortedMonths } = processed;
  
  // 2. State for the selected month
  const [selectedMonth, setSelectedMonth] = useState(
    sortedMonths.length > 0 ? sortedMonths[sortedMonths.length - 1] : ''
  );

  // 3. Filter data for the selected month and build visualizations
  const monthData = useMemo(() => {
    if (!selectedMonth) return null;
    
    const filtered = enriched.filter(t => 
      t.dateObj.toLocaleString('default', { month: 'short', year: 'numeric' }) === selectedMonth
    );
    
    let totalIncome = 0;
    let totalExpenses = 0;
    
    filtered.forEach(t => {
      if (t.type === 'credit') totalIncome += t.amount;
      else totalExpenses += Math.abs(t.amount);
    });
    
    // Daily spending chart
    const dailyMap = {};
    filtered.forEach(t => {
      const day = t.dateObj.getDate();
      if (!dailyMap[day]) dailyMap[day] = { day: day.toString(), expense: 0, income: 0 };
      
      if (t.type === 'debit') dailyMap[day].expense += Math.abs(t.amount);
      else dailyMap[day].income += t.amount;
    });
    
    // Fill in missing days for a smooth chart line up to the max day of the month
    const maxDay = filtered.length > 0 ? new Date(filtered[0].dateObj.getFullYear(), filtered[0].dateObj.getMonth() + 1, 0).getDate() : 30;
    const dailyChartData = [];
    for (let i = 1; i <= maxDay; i++) {
        dailyChartData.push(dailyMap[i] || { day: i.toString(), expense: 0, income: 0 });
    }
    
    // Categories Pie
    const categoryMap = {};
    filtered.filter(t => t.type === 'debit').forEach(t => {
      if (!categoryMap[t.category]) categoryMap[t.category] = 0;
      categoryMap[t.category] += Math.abs(t.amount);
    });
    
    const categoryChartData = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
      
    // Top 5 largest expenses
    const topExpenses = [...filtered]
        .filter(t => t.type === 'debit')
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        .slice(0, 5);

    return {
      transactions: filtered,
      metrics: { totalIncome, totalExpenses, netSavings: totalIncome - totalExpenses },
      dailyChartData,
      categoryChartData,
      topExpenses
    };
    
  }, [enriched, selectedMonth]);

  if (!monthData) return null;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-slate-200 font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color || entry.fill }} className="text-sm flex items-center justify-between space-x-4">
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800/80 shadow-lg">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-indigo-400" />
            Monthly Deep Dive
          </h1>
          <p className="text-slate-400 mt-2">Select a month to analyze your individual performance.</p>
        </div>
        
        <div className="relative">
          <select 
            className="appearance-none bg-slate-950 border border-slate-700 text-slate-200 text-lg font-bold rounded-xl px-6 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-inner"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {sortedMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
            <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <ArrowUpRight className="w-16 h-16 text-emerald-500" />
          </div>
          <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">Total Income</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">{formatCurrency(monthData.metrics.totalIncome)}</span>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <ArrowDownRight className="w-16 h-16 text-rose-500" />
          </div>
          <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">Total Spent</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-rose-600">{formatCurrency(monthData.metrics.totalExpenses)}</span>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <DollarSign className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">Net Flow</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-bold bg-clip-text text-transparent ${monthData.metrics.netSavings >= 0 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-rose-400 to-rose-600'}`}>
              {formatCurrency(monthData.metrics.netSavings)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Visualizations row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* 1. Daily Spends Area Chart */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2 border-t border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-rose-400" />
            Daily Spending Rhythm
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthData.dailyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorDailyExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="expense" name="Spends" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorDailyExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Grouping of Spends Categories */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-1 flex flex-col border-t border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-indigo-400" />
              Monthly Breakdown
            </h2>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={monthData.categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {monthData.categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {monthData.categoryChartData.map((category, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3 shadow-sm" style={{ backgroundColor: CATEGORY_COLORS[category.name] || '#94a3b8' }}></div>
                    <span className="text-slate-300 truncate max-w-[120px]">{category.name}</span>
                  </div>
                  <span className="font-medium text-slate-200">{formatCurrency(category.value)}</span>
                </div>
              ))}
            </div>
        </div>
      </div>

      {/* Top 5 largest splurges list */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl border-t border-slate-700/50">
        <div className="p-6 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-rose-500" />
            Top 5 Largest Spends This Month
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse relative">
            <thead className="bg-slate-900/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">Description</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {monthData.topExpenses.map((t, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{t.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50 font-medium">
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300 max-w-sm" title={t.description}>
                    <div className="truncate font-medium text-slate-200">{t.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-rose-400 tracking-wide">
                    -{formatCurrency(Math.abs(t.amount))}
                  </td>
                </tr>
              ))}
              {monthData.topExpenses.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No spends found for this month.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
