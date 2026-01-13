import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import AddTransaction from './AddTransaction';
import ViewTransactions from './ViewTransactions';
import ReportGenerate from './ReportGenerate';
import Account from './Account';
import Sidebar from './Sidebar';
import WelcomePage from './WelcomePage';
import './Home.css';
import { ReceiptIcon, WalletIcon, BalanceIcon, CountIcon } from './icons';

function Home({ sidebarOpen = false, onToggleSidebar }) {
  const { user } = useAuth();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isViewExpensesOpen, setIsViewExpensesOpen] = useState(false);
  const [isReportGenerateOpen, setIsReportGenerateOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [addInitialData, setAddInitialData] = useState(null);
  const [totals, setTotals] = useState({ totalExpense: 0, totalIncome: 0, totalBalance: 0, expenseCount: 0 });
  const [expenseData, setExpenseData] = useState({
    monthlyTotal: 0,
    totalExpenses: 0,
    monthlyTransactions: 0,
    categoryBreakdown: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenseData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/users/expenses/summary/?username=${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setExpenseData({
          monthlyTotal: data.monthly_total || 0,
          totalExpenses: data.total_expenses || 0,
          monthlyTransactions: data.monthly_transactions || 0,
          categoryBreakdown: data.category_breakdown || []
        });
      } else {
        console.error('Failed to fetch expense summary');
        setError('Failed to load dashboard data.');
      }
    } catch (error) {
      console.error('Error fetching expense summary:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch full expenses list to compute total expense/income/balance
  const fetchAndComputeTotals = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://localhost:8000/api/users/expenses/list/?username=${user.username}`);
      if (res.ok) {
        const data = await res.json();
        const expenses = Array.isArray(data.expenses) ? data.expenses : [];
        let expenseSum = 0;
        let incomeSum = 0;
        let expenseCount = 0;
        for (const tx of expenses) {
          const amt = parseFloat(tx.amount) || 0;
          if (tx.transaction_type === 'expense') { expenseSum += amt; expenseCount += 1; }
          else if (tx.transaction_type === 'income') incomeSum += amt;
        }

        // Fetch accounts and compute total balance as sum of account balances
        let accountsBalance = 0;
        try {
          const accRes = await fetch(`http://localhost:8000/api/users/accounts/?username=${user.username}`);
          if (accRes.ok) {
            const accData = await accRes.json();
            const accounts = Array.isArray(accData) ? accData : [];
            accountsBalance = accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);
          }
        } catch (e) {
          // ignore account fetch error, fallback to income-expense
          accountsBalance = incomeSum - expenseSum;
        }
        setTotals({
          totalExpense: expenseSum,
          totalIncome: incomeSum,
          totalBalance: accountsBalance,
          expenseCount,
        });
      }
    } catch (e) {
      // ignore here; dashboard still shows other cards
    }
  };

  useEffect(() => {
    // When user logs in, ensure we land on dashboard (close any open sections)
    if (user) {
      setIsAddExpenseOpen(false);
      setIsViewExpensesOpen(false);
      setIsReportGenerateOpen(false);
      setIsAccountOpen(false);
    }
    fetchExpenseData();
    fetchAndComputeTotals();
  }, [user]);

  const handleAddTransactionClick = () => {
    setAddInitialData(null);
    setIsAddExpenseOpen(true);
    setIsViewExpensesOpen(false);
    setIsReportGenerateOpen(false);
    setIsAccountOpen(false);
  };

  const handleAddExpenseClose = () => {
    fetchExpenseData();
    fetchAndComputeTotals();
    setIsAddExpenseOpen(false);
  };

  const handleAddExpenseRedirectToAccount = () => {
    // Close Add Expense and open Account page
    setIsAddExpenseOpen(false);
    setIsAccountOpen(true);
  };

  const handleViewTransactionsClick = () => {
    setAddInitialData(null);
    setIsViewExpensesOpen(true);
    setIsAddExpenseOpen(false);
    setIsReportGenerateOpen(false);
    setIsAccountOpen(false);
  };

  // Open AddTransaction with data from a transaction
  const handleEditFromTransactions = (expense) => {
    // Normalize date to yyyy-mm-dd
    const normDate = (() => {
      try {
        const d = new Date(expense.date);
        return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
      } catch {
        return String(expense.date || '').slice(0, 10);
      }
    })();

    const initial = {
      id: expense.id,
      date: normDate || new Date().toISOString().split('T')[0],
      amount: String(expense.amount || ''),
      type: expense.transaction_type || 'expense',
      category: expense.transaction_type === 'transfer' ? '' : (expense.category || 'food'),
      account: expense.transaction_type === 'transfer' ? '' : (expense.account || ''),
      transferFrom: expense.transaction_type === 'transfer' ? (expense.transfer_from || '') : '',
      transferTo: expense.transaction_type === 'transfer' ? (expense.transfer_to || '') : '',
      note: expense.note || ''
    };
    setAddInitialData(initial);
    setIsAddExpenseOpen(true);
    setIsViewExpensesOpen(false);
    setIsReportGenerateOpen(false);
    setIsAccountOpen(false);
  };

  const handleAccountClick = () => {
    setIsAccountOpen(true);
    setIsAddExpenseOpen(false);
    setIsViewExpensesOpen(false);
    setIsReportGenerateOpen(false);
  };

  const handleReportGenerateClick = () => {
    setIsReportGenerateOpen(true);
    setIsAddExpenseOpen(false);
    setIsViewExpensesOpen(false);
    setIsAccountOpen(false);
  };

  const handleDashboardClick = () => {
    setIsAddExpenseOpen(false);
    setIsViewExpensesOpen(false);
    setIsReportGenerateOpen(false);
    setIsAccountOpen(false);
    // Refresh dashboard data when returning to dashboard
    fetchExpenseData();
    fetchAndComputeTotals();
  };

  const handleExpenseAdded = () => {
    fetchExpenseData();
    fetchAndComputeTotals();
    setIsAddExpenseOpen(false);
  };

  const handleViewTransactionsClose = () => {
    setIsViewExpensesOpen(false);
    // Ensure totals and balance (from accounts) are refreshed when leaving view transactions
    fetchExpenseData();
    fetchAndComputeTotals();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const safeExpenseData = {
    monthlyTotal: expenseData?.monthlyTotal || 0,
    monthlyTransactions: expenseData?.monthlyTransactions || 0,
    totalExpenses: expenseData?.totalExpenses || 0,
    categoryBreakdown: expenseData?.categoryBreakdown || []
  };

  const containerClass = `home-container ${sidebarOpen ? 'mobile-sidebar-open' : ''}`.trim();

  return (
    <div className={containerClass}>
      {user && (
        <Sidebar
          onAddExpense={handleAddTransactionClick}
          onViewExpense={handleViewTransactionsClick}
          onAccount={handleAccountClick}
          onReportGenerate={handleReportGenerateClick}
          onDashboard={handleDashboardClick}
        />
      )}
      {/* Mobile overlay to close sidebar */}
      {user && sidebarOpen && (
        <div className="mobile-overlay" onClick={onToggleSidebar} />
      )}
      
      <div className={`main-content ${!user ? 'full-width' : ''}`}>
        {!user ? (
          <WelcomePage />
        ) : (
          <>
                         {isAddExpenseOpen ? (
               <AddTransaction
                isOpen={true}
                initialData={addInitialData}
                onClose={handleAddExpenseClose}
                onExpenseAdded={handleExpenseAdded}
                onRedirectToAccount={handleAddExpenseRedirectToAccount}
              />
                         ) : isViewExpensesOpen ? (
               <ViewTransactions
                isOpen={true}
                onClose={handleViewTransactionsClose}
                onEditRequest={handleEditFromTransactions}
              />
            ) : isAccountOpen ? (
              <Account isOpen={isAccountOpen} />
            ) : isReportGenerateOpen ? (
              <ReportGenerate
                isOpen={true}
                onClose={() => setIsReportGenerateOpen(false)}
              />
            ) : (
              <>
                <div className="home-header">
                  <div className="welcome-section">
                    <div className="user-info">
                      <div className="user-details">
                        <h1>Welcome back, {user?.username}!</h1>
                        <p>Let's track your expenses and manage your finances</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="home-content">
                  {/* Totals row only */}
                  <div className="dashboard-grid">
                    <div className="dashboard-card">
                      <div className="card-icon"><ReceiptIcon width={28} height={28} /></div>
                      <h3>Total Expense</h3>
                      <p className="card-value">{formatCurrency(totals.totalExpense)}</p>
                      <p className="card-subtitle">All time</p>
                    </div>

                    <div className="dashboard-card">
                      <div className="card-icon"><WalletIcon width={28} height={28} /></div>
                      <h3>Total Income</h3>
                      <p className="card-value">{formatCurrency(totals.totalIncome)}</p>
                      <p className="card-subtitle">All time</p>
                    </div>

                    <div className="dashboard-card">
                      <div className="card-icon"><BalanceIcon width={28} height={28} /></div>
                      <h3>Total Balance</h3>
                      <p className="card-value">{formatCurrency(totals.totalBalance)}</p>
                      <p className="card-subtitle">Sum of accounts</p>
                    </div>

                    <div className="dashboard-card">
                      <div className="card-icon"><CountIcon width={28} height={28} /></div>
                      <h3>Expense Count</h3>
                      <p className="card-value">{totals.expenseCount}</p>
                      <p className="card-subtitle">All time</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
