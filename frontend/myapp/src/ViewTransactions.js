import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './ViewTransactions.css';
import {
  FoodIcon,
  TransportIcon,
  ShoppingIcon,
  EntertainmentIcon,
  HealthIcon,
  BookIcon,
  BoltIcon,
  HomeIcon,
  ShieldIcon,
  OthersIcon,
  WalletIcon,
  BankIcon,
  CreditCardIcon,
  PiggyBankIcon,
  InvestmentIcon,
  TransferIcon,
  EditIcon,
  TrashIcon,
  WarningIcon,
  NoteIcon,
} from './icons';

function ViewTransactions({ isOpen, onClose, onEditRequest }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    amount: '',
    transaction_type: 'expense',
    category: '',
    account: '',
    transfer_from: '',
    transfer_to: '',
    note: ''
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    account: '',
    category: ''
  });

  const transactionTypes = [
    { value: '', label: 'All Types' },
    { value: 'expense', label: 'Expense' },
    { value: 'income', label: 'Income' },
    { value: 'transfer', label: 'Transfer' }
  ];

  const expenseCategories = [
    { value: '', label: 'All Categories' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health & Medical' },
    { value: 'education', label: 'Education' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'rent', label: 'Rent & Housing' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'other', label: 'Other' }
  ];

  const incomeCategories = [
    { value: '', label: 'All Categories' },
    { value: 'salary', label: 'Salary' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'investment', label: 'Investment Returns' },
    { value: 'gift', label: 'Gift' },
    { value: 'refund', label: 'Refund' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch accounts from backend
  const fetchAccounts = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/users/accounts/?username=${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        console.error('Failed to fetch accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const refreshData = async () => {
    await fetchExpenses();
    await fetchAccounts();
  };

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
        setFilteredExpenses(data.expenses || []);
      } else {
        console.error('Failed to fetch transactions');
        setError('Failed to load transactions. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchExpenses();
      fetchAccounts();
    }
  }, [isOpen, user]);

  // Apply filters whenever filters or expenses change
  useEffect(() => {
    let filtered = [...expenses];

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(expense => 
        new Date(expense.date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(expense => 
        new Date(expense.date) <= new Date(filters.endDate)
      );
    }

    // Filter by transaction type
    if (filters.type) {
      filtered = filtered.filter(expense => 
        expense.transaction_type === filters.type
      );
    }

    // Filter by account
    if (filters.account) {
      filtered = filtered.filter(expense => {
        if (expense.transaction_type === 'transfer') {
          return expense.transfer_from === filters.account || expense.transfer_to === filters.account;
        }
        return expense.account === filters.account;
      });
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(expense => 
        expense.category === filters.category
      );
    }

    setFilteredExpenses(filtered);
  }, [filters, expenses]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      account: '',
      category: ''
    });
  };

  // Editing helpers
  const beginEdit = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      date: (() => {
        if (!expense.date) return '';
        try {
          const d = new Date(expense.date);
          if (isNaN(d.getTime())) return '';
          return d.toISOString().slice(0, 10);
        } catch {
          return String(expense.date).slice(0, 10);
        }
      })(),
      amount: String(expense.amount || ''),
      transaction_type: expense.transaction_type || 'expense',
      category: expense.category || '',
      account: expense.account || '',
      transfer_from: expense.transfer_from || '',
      transfer_to: expense.transfer_to || '',
      note: expense.note || ''
    });
  };

  const cancelEdit = () => {
    setEditingExpense(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveEdit = async () => {
    if (!editingExpense || !user) return;
    try {
      const payload = {
        username: user.username,
        ...editForm,
      };
      const res = await fetch(`http://localhost:8000/api/users/expenses/${editingExpense.id}/update/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditingExpense(null);
      await refreshData();
    } catch (e) {
      alert('Failed to update transaction.');
    }
  };

  const deleteExpense = async (expense) => {
    if (!user) return;
    const ok = window.confirm('Delete this transaction? This will adjust account balances.');
    if (!ok) return;
    try {
      const res = await fetch(`http://localhost:8000/api/users/expenses/${expense.id}/delete/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      await refreshData();
    } catch (e) {
      alert('Failed to delete transaction.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const sizeProps = { width: 20, height: 20 };
    const map = {
      food: <FoodIcon {...sizeProps} />,
      transport: <TransportIcon {...sizeProps} />,
      shopping: <ShoppingIcon {...sizeProps} />,
      entertainment: <EntertainmentIcon {...sizeProps} />,
      health: <HealthIcon {...sizeProps} />,
      education: <BookIcon {...sizeProps} />,
      utilities: <BoltIcon {...sizeProps} />,
      rent: <HomeIcon {...sizeProps} />,
      insurance: <ShieldIcon {...sizeProps} />,
      other: <OthersIcon {...sizeProps} />,
    };
    return map[category] || <OthersIcon {...sizeProps} />;
  };

  const getAccountIcon = (account) => {
    const sizeProps = { width: 18, height: 18 };
    const map = {
      cash: <WalletIcon {...sizeProps} />,
      bank: <BankIcon {...sizeProps} />,
      credit: <CreditCardIcon {...sizeProps} />,
      savings: <PiggyBankIcon {...sizeProps} />,
      investment: <InvestmentIcon {...sizeProps} />,
      other: <OthersIcon {...sizeProps} />,
    };
    return map[account] || <WalletIcon {...sizeProps} />;
  };

  // Get account label for display
  const getAccountLabel = (accountType) => {
    const account = accounts.find(acc => acc.account_type === accountType);
    return account ? account.name : accountType.replace('_', ' ').toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="view-transactions-container">
      <div className="view-transactions-header">
        <h1>View Transactions</h1>
        <div className="expense-stats">
          <div className="stat-item">
            <span className="stat-label">Total Amount:</span>
            <span className="stat-value">
              {formatCurrency(filteredExpenses.reduce((sum, expense) => {
                if (expense.transaction_type === 'income') {
                  return sum + parseFloat(expense.amount);
                } else if (expense.transaction_type === 'expense') {
                  return sum - parseFloat(expense.amount);
                }
                return sum; // Transfers don't affect total
              }, 0))}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Count:</span>
            <span className="stat-value">{filteredExpenses.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="type">Type:</label>
            <select
              id="type"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              {transactionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="account">Account:</label>
            <select
              id="account"
              value={filters.account}
              onChange={(e) => handleFilterChange('account', e.target.value)}
            >
              <option value="">All Accounts</option>
              {accounts.map(account => (
                <option key={account.id} value={account.account_type}>
                  {account.name} ({account.account_type})
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {(() => {
                let categories = [];
                if (filters.type === 'income') {
                  categories = incomeCategories;
                } else if (filters.type === 'expense') {
                  categories = expenseCategories;
                } else {
                  categories = [...expenseCategories, ...incomeCategories];
                }
                return categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ));
              })()}
            </select>
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>
      
      <div className="view-transactions-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon"><WarningIcon width={24} height={24} /></div>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchExpenses}>
              Try Again
            </button>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-container">
            <div className="empty-icon"><NoteIcon width={24} height={24} /></div>
            <h3>No transactions found</h3>
            <p>
              {expenses.length === 0 
                ? 'Start adding transactions to see them here'
                : 'No transactions match your current filters'
              }
            </p>
            {expenses.length > 0 && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="expenses-list">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className={`expense-card ${expense.transaction_type}`}>
                <div className="expense-header">
                  <div className="expense-category">
                    <span className="category-icon">
                      {expense.transaction_type === 'transfer' 
                        ? <TransferIcon width={20} height={20} /> 
                        : getCategoryIcon(expense.category)}
                    </span>
                    <span className="category-name">
                      {expense.transaction_type === 'transfer'
                        ? 'TRANSFER'
                        : (expense.category ? expense.category.replace('_', ' ').toUpperCase() : expense.transaction_type.toUpperCase())}
                    </span>
                  </div>
                  <div className="expense-right">
                    <div className={`expense-amount ${expense.transaction_type === 'income' ? 'income' : expense.transaction_type === 'expense' ? 'expense' : 'transfer'}`}>
                      {expense.transaction_type === 'income' ? '+' : expense.transaction_type === 'expense' ? '-' : ''}
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                </div>

                <div className="expense-details">
                  <div className="expense-date">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(expense.date)}</span>
                  </div>
                  {expense.transaction_type === 'transfer' ? (
                    <div className="expense-transfer-row">
                      <div className="expense-account">
                        <span className="detail-label">From:</span>
                        <span className="detail-value">
                          <span className="account-icon">{getAccountIcon(expense.transfer_from)}</span>
                          {getAccountLabel(expense.transfer_from)}
                        </span>
                      </div>
                      <div className="expense-account">
                        <span className="detail-label">To:</span>
                        <span className="detail-value">
                          <span className="account-icon">{getAccountIcon(expense.transfer_to)}</span>
                          {getAccountLabel(expense.transfer_to)}
                        </span>
                        <div className="expense-actions inline">
                          <button
                            className="edit-btn"
                            aria-label="Edit transaction"
                            title="Edit"
                            onClick={() => onEditRequest && onEditRequest(expense)}
                          >
                            <EditIcon width={18} height={18} />
                          </button>
                          <button
                            className="delete-btn"
                            aria-label="Delete transaction"
                            title="Delete"
                            onClick={() => deleteExpense(expense)}
                          >
                            <TrashIcon width={18} height={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="expense-account">
                      <span className="detail-label">Account:</span>
                      <span className="detail-value">
                        <span className="account-icon">{getAccountIcon(expense.account)}</span>
                        {getAccountLabel(expense.account)}
                      </span>
                      <div className="expense-actions inline">
                        <button
                          className="edit-btn"
                          aria-label="Edit transaction"
                          title="Edit"
                          onClick={() => onEditRequest && onEditRequest(expense)}
                        >
                          <EditIcon width={18} height={18} />
                        </button>
                        <button
                          className="delete-btn"
                          aria-label="Delete transaction"
                          title="Delete"
                          onClick={() => deleteExpense(expense)}
                        >
                          <TrashIcon width={18} height={18} />
                        </button>
                      </div>
                    </div>
                  )}
                  {expense.note && (
                    <div className="expense-note">
                      <span className="detail-label">Note:</span>
                      <span className="detail-value">{expense.note}</span>
                    </div>
                  )}
                </div>
                {editingExpense && editingExpense.id === expense.id && (
                  <div className="expense-edit" style={{ marginTop: 12, padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                    <div className="edit-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div>
                        <label>Date</label>
                        <input type="date" value={editForm.date} onChange={(e) => handleEditChange('date', e.target.value)} />
                      </div>
                      <div>
                        <label>Amount</label>
                        <input type="number" step="0.01" value={editForm.amount} onChange={(e) => handleEditChange('amount', e.target.value)} />
                      </div>
                      <div>
                        <label>Type</label>
                        <select value={editForm.transaction_type} onChange={(e) => handleEditChange('transaction_type', e.target.value)}>
                          {transactionTypes.filter(t => t.value !== '').map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {editForm.transaction_type === 'transfer' ? (
                      <div className="edit-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                        <div>
                          <label>From</label>
                          <select value={editForm.transfer_from} onChange={(e) => handleEditChange('transfer_from', e.target.value)}>
                            <option value="">Select account</option>
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.account_type}>{acc.name} ({acc.account_type})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label>To</label>
                          <select value={editForm.transfer_to} onChange={(e) => handleEditChange('transfer_to', e.target.value)}>
                            <option value="">Select account</option>
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.account_type}>{acc.name} ({acc.account_type})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="edit-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                        <div>
                          <label>Category</label>
                          <select value={editForm.category} onChange={(e) => handleEditChange('category', e.target.value)}>
                            {(editForm.transaction_type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                              <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label>Account</label>
                          <select value={editForm.account} onChange={(e) => handleEditChange('account', e.target.value)}>
                            <option value="">Select account</option>
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.account_type}>{acc.name} ({acc.account_type})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    <div className="edit-row" style={{ marginTop: 12 }}>
                      <label>Note</label>
                      <textarea rows={2} value={editForm.note} onChange={(e) => handleEditChange('note', e.target.value)} />
                    </div>
                    <div className="edit-actions" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="save-btn" onClick={saveEdit}>Save</button>
                      <button className="cancel-btn" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

}
export default ViewTransactions;
