import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './ReportGenerate.css';
import {
  ChartIcon,
  CalendarIcon,
  WalletIcon,
  FoodIcon,
  TransportIcon,
  ShoppingIcon,
  EntertainmentIcon,
  HealthIcon,
  BillsIcon,
  OthersIcon
} from './icons';

function ReportGenerate({ isOpen, onClose }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportPeriod, setReportPeriod] = useState('month'); // week, month

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8000/api/users/expenses/list/?username=${user?.username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses || []);
      } else {
        console.error('Failed to fetch expenses');
        setError('Failed to load expenses. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simple SVG Line Chart (Monthly spending trend)
  const LineChart = ({ data, width = 360, height = 220, padding = 32 }) => {
    if (!data || !data.length) return null;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const xStep = (width - padding * 2) / (data.length - 1 || 1);
    const yScale = (val) => {
      const h = height - padding * 2;
      return padding + (h - (val / maxVal) * h);
    };
    const points = data.map((d, i) => [padding + i * xStep, yScale(d.value)]);
    const polyPoints = points.map(p => p.join(',')).join(' ');

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e2e8f0" />

        {/* Line */}
        <polyline
          fill="none"
          stroke="var(--color-blue)"
          strokeWidth="3"
          points={polyPoints}
        />

        {/* Points */}
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3.5} fill="var(--color-blue)" />
        ))}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={d.label}
                x={padding + i * xStep}
                y={height - padding + 18}
                fontSize="10"
                textAnchor="middle"
                fill="var(--color-gray)">
            {d.label}
          </text>
        ))}
      </svg>
    );
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchExpenses();
    }
  }, [isOpen, user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'food':
        return <FoodIcon width={20} height={20} />;
      case 'transport':
        return <TransportIcon width={20} height={20} />;
      case 'shopping':
        return <ShoppingIcon width={20} height={20} />;
      case 'entertainment':
        return <EntertainmentIcon width={20} height={20} />;
      case 'health':
        return <HealthIcon width={20} height={20} />;
      case 'utilities':
        return <BillsIcon width={20} height={20} />;
      case 'education':
      case 'insurance':
      case 'rent':
      case 'other':
      default:
        return <OthersIcon width={20} height={20} />;
    }
  };

  const getAccountIcon = (account) => {
    switch (account) {
      case 'cash':
        return <WalletIcon width={20} height={20} />;
      case 'bank':
        return <OthersIcon width={20} height={20} />;
      case 'credit':
      case 'debit':
        return <BillsIcon width={20} height={20} />;
      case 'digital':
        return <OthersIcon width={20} height={20} />;
      case 'other':
      default:
        return <OthersIcon width={20} height={20} />;
    }
  };

  // Simple SVG Bar Chart: Income vs Expense
  const BarChart = ({ data, width = 420, height = 220, padding = 32 }) => {
    if (!data || !data.length) return null;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const chartW = width - padding * 2;
    const chartH = height - padding * 2;
    const barGap = 28;
    const barWidth = (chartW - barGap * (data.length - 1)) / data.length;
    const y = (val) => padding + (chartH - (val / maxVal) * chartH);
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e2e8f0" />
        {data.map((d, i) => {
          const x = padding + i * (barWidth + barGap);
          const top = y(d.value);
          const h = height - padding - top;
          return (
            <g key={d.label}>
              <rect x={x} y={top} width={barWidth} height={h} fill={d.color || 'var(--color-blue)'} rx={6} />
              <text x={x + barWidth / 2} y={height - padding + 16} fontSize="12" textAnchor="middle" fill="var(--color-gray)">{d.label}</text>
              <text x={x + barWidth / 2} y={top - 6} fontSize="12" textAnchor="middle" fill="var(--color-black)" fontWeight="600">{formatCurrency(d.value)}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Simple SVG Pie (Donut) Chart Component (no external libs)
  const PieChart = ({ data, size = 220, strokeWidth = 36 }) => {
    const total = data.reduce((s, d) => s + d.value, 0);
    if (!total) return null;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let cumulative = 0;

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
        />
        {data.map((d, i) => {
          const fraction = d.value / total;
          const dash = fraction * circumference;
          const offset = -cumulative * circumference;
          cumulative += fraction;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          );
        })}
      </svg>
    );
  };

  // Calculate report data
  const calculateReportData = () => {
    if (!expenses.length) return null;

    const now = new Date();
    let startDate = new Date();

    // Set start date based on report period
    switch (reportPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Filter expenses for the selected period
    const periodExpenses = expenses.filter(expense => 
      new Date(expense.date) >= startDate
    );

    // Calculate totals
    const totalAmount = periodExpenses.reduce((sum, expense) => 
      sum + parseFloat(expense.amount), 0
    );
    const expenseOnly = periodExpenses.filter(tx => (tx.transaction_type || tx.type) === 'expense');
    const incomeOnly = periodExpenses.filter(tx => (tx.transaction_type || tx.type) === 'income');
    const expenseTotal = expenseOnly.reduce((s, tx) => s + (parseFloat(tx.amount) || 0), 0);
    const incomeTotal = incomeOnly.reduce((s, tx) => s + (parseFloat(tx.amount) || 0), 0);

    // Category breakdown
    const categoryBreakdown = periodExpenses.reduce((acc, expense) => {
      const category = expense.category;
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 };
      }
      acc[category].total += parseFloat(expense.amount);
      acc[category].count += 1;
      return acc;
    }, {});

    // Account breakdown
    const accountBreakdown = periodExpenses.reduce((acc, expense) => {
      const account = expense.account;
      if (!acc[account]) {
        acc[account] = { total: 0, count: 0 };
      }
      acc[account].total += parseFloat(expense.amount);
      acc[account].count += 1;
      return acc;
    }, {});

    // Top expenses (expense-only within filtered period)
    const topExpenses = periodExpenses
      .filter(exp => (exp.transaction_type || exp.type) === 'expense')
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
      .slice(0, 5);

    return {
      totalAmount,
      totalCount: periodExpenses.length,
      categoryBreakdown,
      accountBreakdown,
      topExpenses,
      averageAmount: totalAmount / periodExpenses.length || 0,
      incomeTotal,
      expenseTotal
    };
  };

  const reportData = calculateReportData();

  if (!isOpen) return null;

  return (
    <div className="report-generate-container">
      <div className="report-header">
        <h1>Expense Report</h1>
        <div className="report-controls">
          <div className="period-selector">
            <label htmlFor="reportPeriod">Report Period:</label>
            <select
              id="reportPeriod"
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
          </div>
        </div>
      </div>

      <div className="report-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Generating report...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon"><OthersIcon width={22} height={22} /></div>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchExpenses}>
              Try Again
            </button>
          </div>
        ) : !reportData ? (
          <div className="empty-container">
            <div className="empty-icon"><ChartIcon width={22} height={22} /></div>
            <h3>No data available</h3>
            <p>Start adding expenses to generate reports</p>
          </div>
        ) : (
          <div className="report-sections">
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card" style={{ color: '#fff' }}>
                <div className="card-icon"><WalletIcon width={28} height={28} /></div>
                <h3 style={{ color: '#fff' }}>Total Spent</h3>
                <p className="card-value" style={{ color: '#fff' }}>{formatCurrency(reportData.totalAmount)}</p>
                <p className="card-subtitle" style={{ color: 'rgba(255,255,255,0.92)' }}>{reportData.totalCount} transactions</p>
              </div>
              
              <div className="summary-card" style={{ color: '#fff' }}>
                <div className="card-icon"><ChartIcon width={28} height={28} /></div>
                <h3 style={{ color: '#fff' }}>Average</h3>
                <p className="card-value" style={{ color: '#fff' }}>{formatCurrency(reportData.averageAmount)}</p>
                <p className="card-subtitle" style={{ color: 'rgba(255,255,255,0.92)' }}>per transaction</p>
              </div>
              
              <div className="summary-card" style={{ color: '#fff' }}>
                <div className="card-icon"><CalendarIcon width={28} height={28} /></div>
                <h3 style={{ color: '#fff' }}>Period</h3>
                <p className="card-value" style={{ color: '#fff' }}>{reportPeriod === 'week' ? '1 Week' : '1 Month'}</p>
                <p className="card-subtitle" style={{ color: 'rgba(255,255,255,0.92)' }}>report period</p>
              </div>
            </div>

            {/* Category Distribution (Pie Chart) */}
            <div className="report-section">
              <h2>Category Distribution</h2>
              {(() => {
                const entries = Object.entries(reportData.categoryBreakdown)
                  .sort(([, a], [, b]) => b.total - a.total);
                const palette = [
                  '#4F46E5', '#22C55E', '#F59E0B', '#EF4444', '#06B6D4',
                  '#8B5CF6', '#84CC16', '#F97316', '#10B981', '#3B82F6'
                ];
                const chartData = entries.map(([category, d], idx) => ({
                  label: category,
                  value: d.total,
                  color: palette[idx % palette.length]
                }));
                // Build monthly spending trend for last 6 months (expenses only)
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                const monthlyBuckets = new Map();
                for (let i = 5; i >= 0; i--) {
                  const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  const key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
                  monthlyBuckets.set(key, { label: dt.toLocaleString('en-US', { month: 'short' }), value: 0 });
                }
                (expenses || []).forEach(tx => {
                  const isExpense = (tx.transaction_type || tx.type) === 'expense';
                  const d = new Date(tx.date);
                  if (!isExpense || d < start) return;
                  const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
                  if (monthlyBuckets.has(key)) {
                    monthlyBuckets.get(key).value += parseFloat(tx.amount) || 0;
                  }
                });
                const monthlyTrend = Array.from(monthlyBuckets.values());
                return entries.length ? (
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', width: '100%' }}>
                    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                      <PieChart data={chartData} />
                      <div style={{ display: 'grid', gap: 8 }}>
                        {chartData.map((d) => (
                          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 12, height: 12, background: d.color, display: 'inline-block', borderRadius: 2 }}></span>
                            <span style={{ minWidth: 110 }}>{d.label.toUpperCase()}</span>
                            <span style={{ fontWeight: 600 }}>{formatCurrency(d.value)}</span>
                            <span style={{ color: '#6b7280' }}>
                              {((d.value / reportData.totalAmount) * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-black)' }}>Monthly Spending Trend</h3>
                      <LineChart data={monthlyTrend} />
                    </div>
                  </div>
                ) : (
                  <div className="empty-container">
                    <div className="empty-icon"><ChartIcon width={22} height={22} /></div>
                    <p>No category data for this period.</p>
                  </div>
                );
              })()}
            </div>

            {/* Income vs Expense (Bar Chart) */}
            <div className="report-section">
              <h2>Income vs Expense</h2>
              <div style={{ overflowX: 'auto' }}>
                <BarChart
                  data={[
                    { label: 'Income', value: reportData.incomeTotal, color: '#22C55E' },
                    { label: 'Expense', value: reportData.expenseTotal, color: '#EF4444' },
                  ]}
                />
              </div>
            </div>

            {/* Account Breakdown */}
            <div className="report-section">
              <h2>Account Usage</h2>
              <div className="breakdown-grid">
                {Object.entries(reportData.accountBreakdown)
                  .sort(([,a], [,b]) => b.total - a.total)
                  .map(([account, data]) => (
                    <div key={account} className="breakdown-item">
                      <div className="breakdown-header">
                        <span className="account-icon">{getAccountIcon(account)}</span>
                        <span className="account-name">{account.toUpperCase()}</span>
                      </div>
                      <div className="breakdown-details">
                        <span className="amount">{formatCurrency(data.total)}</span>
                        <span className="percentage">
                          {((data.total / reportData.totalAmount) * 100).toFixed(1)}%
                        </span>
                        <span className="count">{data.count} transactions</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Expenses (filtered by selected period) */}
            <div className="report-section">
              <h2>Top 5 Expenses</h2>
              <div className="top-expenses">
                {reportData.topExpenses.map((expense, index) => (
                  <div key={expense.id} className="top-expense-item">
                    <div className="rank">#{index + 1}</div>
                    <div className="expense-info">
                      <div className="expense-category">
                        <span className="category-icon">{getCategoryIcon(expense.category)}</span>
                        <span className="category-name">{expense.category.toUpperCase()}</span>
                      </div>
                      <div className="expense-date">
                        {new Date(expense.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      {expense.note && <div className="expense-note">{expense.note}</div>}
                    </div>
                    <div className="expense-amount">{formatCurrency(expense.amount)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights removed as requested */}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportGenerate;
