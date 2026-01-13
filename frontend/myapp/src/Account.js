import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './Account.css';
import { WalletIcon, CreditCardIcon, PlusIcon, EditIcon, TrashIcon, WarningIcon } from './icons';

function Account({ isOpen }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [newAccount, setNewAccount] = useState({
    name: '',
    balance: '',
    account_type: 'cash'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);



  // Fetch accounts from backend
  const fetchAccounts = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const ts = Date.now();
      const response = await fetch(`http://localhost:8000/api/users/accounts/?username=${user.username}&_=${ts}` , {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        console.error('Failed to fetch accounts');
        setError('Failed to load accounts.');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [user, isOpen]);

  // Refresh accounts when component becomes visible
  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
    }
  }, [isOpen]);

  const handleAddAccount = () => {
    setIsAddAccountOpen(true);
    setIsEditMode(false);
    setEditingAccount(null);
    setNewAccount({ name: '', balance: '', account_type: '' });
    setErrors({});
  };

  const handleCloseAddAccount = () => {
    setIsAddAccountOpen(false);
    setIsEditMode(false);
    setEditingAccount(null);
  };

  const handleEditAccount = (account) => {
    setIsEditMode(true);
    setEditingAccount(account);
    setNewAccount({
      name: account.name,
      balance: account.balance.toString(),
      account_type: account.account_type
    });
    setErrors({});
  };

  const handleDeleteAccount = (account) => {
    setAccountToDelete(account);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/users/accounts/${accountToDelete.id}/delete/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username }),
      });

      if (response.ok) {
        // Refresh accounts list
        await fetchAccounts();
        setIsDeleteConfirmOpen(false);
        setAccountToDelete(null);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Failed to delete account' });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setAccountToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({
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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!newAccount.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    
    if (!newAccount.account_type.trim()) {
      newErrors.account_type = 'Account type is required';
    }
    
    if (newAccount.balance === '') {
      newErrors.balance = 'Balance is required';
    } else if (isNaN(newAccount.balance)) {
      newErrors.balance = 'Balance must be a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        if (isEditMode && editingAccount) {
          // Update existing account
          const accountData = {
            name: newAccount.name.trim(),
            balance: parseFloat(newAccount.balance),
            account_type: newAccount.account_type,
            username: user.username
          };

          const response = await fetch(`http://localhost:8000/api/users/accounts/${editingAccount.id}/update/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(accountData),
          });

          if (response.ok) {
            await fetchAccounts();
            setIsEditMode(false);
            setEditingAccount(null);
            setIsAddAccountOpen(false);
            setNewAccount({ name: '', balance: '', account_type: '' });
          } else {
            const errorData = await response.json();
            setErrors({ submit: errorData.error || 'Failed to update account' });
          }
        } else {
          // Create new account
          const accountData = {
            name: newAccount.name.trim(),
            balance: parseFloat(newAccount.balance),
            account_type: newAccount.account_type,
            username: user.username
          };

          const response = await fetch('http://localhost:8000/api/users/accounts/create/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(accountData),
          });

          if (response.ok) {
            await fetchAccounts();
            setIsAddAccountOpen(false);
            setNewAccount({ name: '', balance: '', account_type: '' });
          } else {
            const errorData = await response.json();
            setErrors({ submit: errorData.error || 'Failed to create account' });
          }
        }
      } catch (error) {
        console.error('Error saving account:', error);
        setErrors({ submit: 'Network error. Please try again.' });
      }
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + parseFloat(account.balance), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };



  if (isLoading) {
    return (
      <div className="account-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading accounts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="account-container">
        <div className="error-state">
          <div className="error-icon"><WarningIcon width={24} height={24} /></div>
          <p>{error}</p>
          <button onClick={fetchAccounts} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-container">
      <div className="account-header">
        <div className="header-content">
          <h1>Account Management</h1>
          <p>Manage your financial accounts and track balances</p>
        </div>
        <button className="add-account-btn" onClick={handleAddAccount}>
          <span className="btn-icon"><PlusIcon width={18} height={18} /></span>
          Add Account
        </button>
      </div>

      <div className="account-content">
        {/* Total Balance Card */}
        <div className="total-balance-card">
          <div className="balance-icon"><WalletIcon width={24} height={24} /></div>
          <div className="balance-info">
            <h3>Total Balance</h3>
            <p className="total-amount">{formatCurrency(getTotalBalance())}</p>
            <p className="balance-subtitle">Across all accounts</p>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="accounts-section">
          <h2>Your Accounts</h2>
          {accounts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><CreditCardIcon width={28} height={28} /></div>
              <p>No accounts yet</p>
              <p className="empty-subtitle">Create your first account to get started</p>
            </div>
          ) : (
            <div className="accounts-grid">
              {accounts.map(account => (
                <div key={account.id} className={`account-card ${account.account_type}`}>
                  <div className="account-header-card">
                    <div className="account-icon"><CreditCardIcon width={20} height={20} /></div>
                    <div className="account-info">
                      <h3>{account.name}</h3>
                      <p className="account-type">{account.account_type}</p>
                    </div>
                  </div>
                  <div className="account-balance">
                    <p className={`balance-amount ${parseFloat(account.balance) < 0 ? 'negative' : 'positive'}`}>
                      {formatCurrency(account.balance)}
                    </p>
                    <p className="balance-label">Current Balance</p>
                  </div>
                  <div className="account-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditAccount(account)}
                      title="Edit Account"
                    >
                      <EditIcon width={18} height={18} />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteAccount(account)}
                      title="Delete Account"
                    >
                      <TrashIcon width={18} height={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Account Modal */}
      {(isAddAccountOpen || isEditMode) && (
        <div className="modal-overlay" onClick={handleCloseAddAccount}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Account' : 'Add New Account'}</h2>
              <button className="close-button" onClick={handleCloseAddAccount}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="add-account-form">
              {errors.submit && (
                <div className="error-message global-error">{errors.submit}</div>
              )}
              
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newAccount.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="account_type">Account Type</label>
                <input
                  type="text"
                  id="account_type"
                  name="account_type"
                  value={newAccount.account_type}
                  onChange={handleInputChange}
                  placeholder="e.g., Cash, Bank, Credit Card"
                  className={errors.account_type ? 'error' : ''}
                />
                {errors.account_type && <span className="error-message">{errors.account_type}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="balance">Current Balance</label>
                <input
                  type="number"
                  id="balance"
                  name="balance"
                  value={newAccount.balance}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  className={errors.balance ? 'error' : ''}
                />
                {errors.balance && <span className="error-message">{errors.balance}</span>}
                <p className="help-text">Use negative values for credit cards or loans</p>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseAddAccount}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {isEditMode ? 'Update Account' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content delete-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Account</h2>
              <button className="close-button" onClick={handleCancelDelete}>×</button>
            </div>
            
            <div className="delete-confirm-content">
              <div className="delete-warning">
                <div className="warning-icon"><WarningIcon width={24} height={24} /></div>
                <h3>Are you sure you want to delete this account?</h3>
                <p><strong>{accountToDelete?.name}</strong> ({accountToDelete?.account_type})</p>
                <p className="warning-text">This action cannot be undone. All associated data will be permanently removed.</p>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancelDelete}>
                  Cancel
                </button>
                <button type="button" className="delete-confirm-btn" onClick={handleConfirmDelete}>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Account;
