import { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell, LineChart, Line, PieChart, Pie
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, PieChart as PieChartIcon, TrendingUp, BarChart3, ListFilter } from 'lucide-react';

const CATEGORY_COLORS = {
  'Retail & Shopping': '#8b5cf6',
  'Food & Dining': '#f59e0b',
  'Bills & Utilities': '#3b82f6',
  'Health & Medical': '#ec4899',
  'Transport': '#14b8a6',
  'Friends & Others': '#64748b',
  'Income/Refund': '#10b981'
};

const categorizeTransaction = (description, type) => {
  if (type === 'credit') return 'Income/Refund';
  
  const desc = description.toLowerCase();
  if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('myntra') || desc.includes('mart') || desc.includes('supermarket') || desc.includes('store') || desc.includes('retail')) {
    return 'Retail & Shopping';
  }
  if (desc.includes('zomato') || desc.includes('swiggy') || desc.includes('hotel') || desc.includes('restaurant') || desc.includes('cafe') || desc.includes('bakery') || desc.includes('dairy')) {
    return 'Food & Dining';
  }
  if (desc.includes('cred') || desc.includes('bill') || desc.includes('recharge') || desc.includes('electricity') || desc.includes('broadband') || desc.includes('airtel') || desc.includes('jio')) {
    return 'Bills & Utilities';
  }
  if (desc.includes('medical') || desc.includes('pharma') || desc.includes('hospital') || desc.includes('clinic')) {
    return 'Health & Medical';
  }
  if (desc.includes('cab') || desc.includes('uber') || desc.includes('ola') || desc.includes('rapido') || desc.includes('irctc') || desc.includes('ticket')) {
    return 'Transport';
  }
  return 'Friends & Others';
};

const parseDateStrToObj = (dateStr) => {
  // Parsing date from format DD MMM YYYY or DD-MM-YY 
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  
  const parts = dateStr.split(/[-/]/);
  if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      let year = parseInt(parts[2], 10);
      if (year < 100) year += 2000;
      return new Date(year, month, day);
  }
  return new Date();
};

export default function Dashboard({ transactions }) {
  const [timeFilter, setTimeFilter] = useState('all');
  
  const processedData = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    
    // Enrich with parsed date and category
    const enriched = transactions.map(t => {
      const dateObj = parseDateStrToObj(t.date);
      const category = categorizeTransaction(t.description, t.type);
      return { ...t, dateObj, category };
    }).sort((a, b) => a.dateObj - b.dateObj);
    
    enriched.forEach(t => {
      if (t.type === 'credit') totalIncome += t.amount;
      else totalExpenses += Math.abs(t.amount);
    });

    const monthlyDataMap = {};
    enriched.forEach(t => {
      const monthYear = t.dateObj.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!monthlyDataMap[monthYear]) {
        monthlyDataMap[monthYear] = { month: monthYear, income: 0, expense: 0, endBalance: null };
      }
      if (t.type === 'credit') monthlyDataMap[monthYear].income += t.amount;
      else monthlyDataMap[monthYear].expense += Math.abs(t.amount);
      
      monthlyDataMap[monthYear].endBalance = t.balance; 
    });
    
    const monthlyChartData = Object.values(monthlyDataMap);
    
    const categoryMap = {};
    enriched.filter(t => t.type === 'debit').forEach(t => {
      if (!categoryMap[t.category]) categoryMap[t.category] = 0;
      categoryMap[t.category] += Math.abs(t.amount);
    });
    
    const categoryChartData = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      transactions: enriched,
      metrics: {
        totalIncome,
        totalExpenses,
        netSavings: totalIncome - totalExpenses,
        transactionCount: enriched.length
      },
      monthlyChartData,
      categoryChartData
    };
  }, [transactions]);

  const { metrics, monthlyChartData, categoryChartData, transactions: sortedTransactions } = processedData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

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
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Financial Overview</h1>
          <p className="text-slate-400 mt-2 text-lg">Analyzing {metrics.transactionCount} transactions deeply.</p>
        </div>
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50 w-max">
          <button className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-500/20 text-blue-400 shadow-sm">All Time</button>
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
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600">{formatCurrency(metrics.totalIncome)}</span>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <ArrowDownRight className="w-16 h-16 text-rose-500" />
          </div>
          <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">Total Expenses</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-rose-600">{formatCurrency(metrics.totalExpenses)}</span>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <DollarSign className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">Net Flow</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-3xl font-bold bg-clip-text text-transparent ${metrics.netSavings >= 0 ? 'bg-gradient-to-r from-blue-400 to-indigo-500' : 'bg-gradient-to-r from-rose-400 to-rose-600'}`}>
              {formatCurrency(metrics.netSavings)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Visualizations row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* 1. Bar chart: Monthly Income vs Expense */}
        <div className="glass-panel p-6 rounded-2xl border-t border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
            Monthly Cash Flow
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false}/>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Line chart: Balance Over Time */}
        <div className="glass-panel p-6 rounded-2xl border-t border-slate-700/50">
          <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Balance Over Time
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(value) => `₹${value/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="endBalance" name="End Balance" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visualizations row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* 2. Grouping of Spends Categories */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-1 flex flex-col border-t border-slate-700/50">
            <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-rose-400" />
              Top Spending Categories
            </h2>
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 uppercase tracking-widest">Expenses</span>
                <span className="text-xl font-bold text-slate-200">{formatCurrency(metrics.totalExpenses)}</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-3 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
              {categoryChartData.map((category, idx) => (
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

        {/* Extended list for the remaining space */}
        <div className="glass-panel rounded-2xl overflow-hidden lg:col-span-2 shadow-xl flex flex-col border-t border-slate-700/50">
          <div className="p-6 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center">
              <ListFilter className="w-5 h-5 mr-2 text-indigo-400" />
              Latest 10 Transactions
            </h2>
          </div>
          <div className="overflow-x-auto flex-1 h-[400px]">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedTransactions.slice().reverse().slice(0, 10).map((t, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{t.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/50 font-medium whitespace-nowrap overflow-hidden text-ellipsis inline-block max-w-[120px]" title={t.category}>
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 max-w-[200px]" title={t.description}>
                      <div className="truncate group-hover:text-white transition-colors">{t.description}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold tracking-wide ${t.type === 'credit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {t.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(t.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
