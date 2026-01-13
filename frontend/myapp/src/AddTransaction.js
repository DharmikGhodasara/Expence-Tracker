import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './AddTransaction.css';

function AddTransaction({ isOpen, onClose, onExpenseAdded, onRedirectToAccount, initialData }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    type: 'expense', // New field: income, expense, or transfer
    category: 'food',
    account: 'cash',
    transferFrom: '', // New field for transfer from account
    transferTo: '', // New field for transfer to account
    note: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  const categories = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'rent', label: 'Rent/Mortgage' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'other', label: 'Other' }
  ];

  const incomeCategories = [
    { value: 'salary', label: 'Salary' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'investment', label: 'Investment Returns' },
    { value: 'gift', label: 'Gift' },
    { value: 'refund', label: 'Refund' },
    { value: 'other', label: 'Other' }
  ];

  // Fetch accounts from backend
  const fetchAccounts = async () => {
    if (!user) {
      setIsLoadingAccounts(false);
      return;
    }
    
    setIsLoadingAccounts(true);
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
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  // Prefill when opened with initialData
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        date: initialData.date || new Date().toISOString().split('T')[0],
        amount: String(initialData.amount ?? ''),
        type: initialData.type || 'expense',
        category: initialData.type === 'transfer' ? '': (initialData.category || 'food'),
        account: initialData.type === 'transfer' ? '': (initialData.account || 'cash'),
        transferFrom: initialData.type === 'transfer' ? (initialData.transferFrom || '') : '',
        transferTo: initialData.type === 'transfer' ? (initialData.transferTo || '') : '',
        note: initialData.note || ''
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Reset transfer fields when type changes
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        transferFrom: '',
        transferTo: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    
    if (formData.type === 'transfer') {
      if (!formData.transferFrom) {
        newErrors.transferFrom = 'Transfer from account is required';
      }
      if (!formData.transferTo) {
        newErrors.transferTo = 'Transfer to account is required';
      }
      if (formData.transferFrom === formData.transferTo) {
        newErrors.transferTo = 'Transfer accounts must be different';
      }
    } else {
      if (!formData.category) {
        newErrors.category = 'Category is required';
      }
      if (!formData.account) {
        newErrors.account = 'Account is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        const expenseData = {
          date: formData.date,
          amount: formData.amount,
          transaction_type: formData.type,
          category: formData.type === 'transfer' ? '' : formData.category,
          account: formData.type === 'transfer' ? '' : formData.account,
          transfer_from: formData.type === 'transfer' ? formData.transferFrom : '',
          transfer_to: formData.type === 'transfer' ? formData.transferTo : '',
          note: formData.note,
          username: user.username
        };

        const isEditing = Boolean(initialData && initialData.id);
        const url = isEditing
          ? `http://localhost:8000/api/users/expenses/${initialData.id}/update/`
          : 'http://localhost:8000/api/users/expenses/';
        const method = isEditing ? 'PUT' : 'POST';

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(expenseData),
        });

        if (response.ok) {
          const result = await response.json().catch(() => ({}));
          if (!isEditing) {
            setFormData({
              date: new Date().toISOString().split('T')[0],
              amount: '',
              type: 'expense',
              category: 'food',
              account: 'cash',
              transferFrom: '',
              transferTo: '',
              note: ''
            });
          }
          setErrors({});
          // Refresh dashboard totals (stay on the same page)
          onExpenseAdded();
        } else {
          const errorData = await response.json();
          setErrors({ submit: errorData.error || 'Failed to create transaction' });
        }
      } catch (error) {
        console.error('Error creating transaction:', error);
        setErrors({ submit: 'Network error. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddAccountRedirect = () => {
    // Redirect to Account page
    onRedirectToAccount();
  };

  const getCurrentCategories = () => {
    switch (formData.type) {
      case 'income':
        return incomeCategories;
      case 'expense':
        return categories;
      default:
        return [];
    }
  };

  const getSubmitButtonText = () => {
    const isEditing = Boolean(initialData && initialData.id);
    if (isEditing) {
      switch (formData.type) {
        case 'income':
          return 'Update Income';
        case 'expense':
          return 'Update Transaction';
        case 'transfer':
          return 'Update Transfer';
        default:
          return 'Update Transaction';
      }
    }
    switch (formData.type) {
      case 'income':
        return 'Add Income';
      case 'expense':
        return 'Add Transaction';
      case 'transfer':
        return 'Add Transfer';
      default:
        return 'Add Transaction';
    }
  };

  if (!isOpen) return null;

  return (
         <div className="add-transaction-container">
       <div className="add-transaction-header">
         <h1>{initialData && initialData.id ? 'Edit Transaction' : 'Add New Transaction'}</h1>
       </div>

       <div className="add-transaction-content">
        <form onSubmit={handleSubmit} className="expense-form-inline">
          {errors.submit && (
            <div className="error-message global-error">{errors.submit}</div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={errors.amount ? 'error' : ''}
              />
              {errors.amount && <span className="error-message">{errors.amount}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={errors.type ? 'error' : ''}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>

            {formData.type !== 'transfer' && (
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={errors.category ? 'error' : ''}
                >
                  {getCurrentCategories().map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>
            )}
          </div>

          {formData.type === 'transfer' ? (
            // Transfer fields
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="transferFrom">From Account</label>
                <select
                  id="transferFrom"
                  name="transferFrom"
                  value={formData.transferFrom}
                  onChange={handleChange}
                  className={errors.transferFrom ? 'error' : ''}
                >
                  <option value="">Select account</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.account_type}>
                      {account.name} ({account.account_type})
                    </option>
                  ))}
                </select>
                {errors.transferFrom && <span className="error-message">{errors.transferFrom}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="transferTo">To Account</label>
                <select
                  id="transferTo"
                  name="transferTo"
                  value={formData.transferTo}
                  onChange={handleChange}
                  className={errors.transferTo ? 'error' : ''}
                >
                  <option value="">Select account</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.account_type}>
                      {account.name} ({account.account_type})
                    </option>
                  ))}
                </select>
                {errors.transferTo && <span className="error-message">{errors.transferTo}</span>}
              </div>
            </div>
          ) : (
            // Regular account field for income/expense
            <div className="form-group">
              <label htmlFor="account">Account</label>
              <select
                id="account"
                name="account"
                value={formData.account}
                onChange={handleChange}
                className={errors.account ? 'error' : ''}
              >
                {isLoadingAccounts ? (
                  <option value="">Loading accounts...</option>
                ) : (
                  <>
                    {accounts.length > 0 ? (
                      accounts.map(account => (
                        <option key={account.id} value={account.account_type}>
                          {account.name} ({account.account_type})
                        </option>
                      ))
                    ) : (
                      <option value="">No accounts available</option>
                    )}
                    <option value="add_new" className="add-account-option">
                      Add New Account
                    </option>
                  </>
                )}
              </select>
              {errors.account && <span className="error-message">{errors.account}</span>}
              
              {formData.account === 'add_new' && (
                <div className="add-account-redirect">
                  <p>No accounts available. Let's create one!</p>
                  <button 
                    type="button" 
                    className="redirect-to-account-btn"
                    onClick={handleAddAccountRedirect}
                  >
                    Go to Account Management
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="note">Note (Optional)</label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Add a note about this transaction..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : getSubmitButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTransaction;
