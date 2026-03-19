export const CATEGORY_COLORS = {
  'Retail & Shopping': '#8b5cf6',
  'Food & Dining': '#f59e0b',
  'Bills & Utilities': '#3b82f6',
  'Health & Medical': '#ec4899',
  'Transport': '#14b8a6',
  'Friends & Others': '#64748b',
  'Income/Refund': '#10b981'
};

export const categorizeTransaction = (description, type) => {
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

export const parseDateStrToObj = (dateStr) => {
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

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};
