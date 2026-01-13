import React from 'react';
import './Sidebar.css';
import { HomeIcon, PlusIcon, EyeIcon, CreditCardIcon, ChartIcon } from './icons';

function Sidebar({ onAddExpense, onViewExpense, onReportGenerate, onDashboard, onAccount }) {

  return (
    <div className="sidebar">

      <nav className="sidebar-nav">
        <ul className="nav-menu">
          <li className="nav-item">
            <button className="nav-link" onClick={onDashboard}>
              <span className="nav-icon"><HomeIcon width={20} height={20} /></span>
              <span className="nav-text">Dashboard</span>
            </button>
          </li>
                           <li className="nav-item">
                   <button className="nav-link" onClick={onAddExpense}>
                     <span className="nav-icon"><PlusIcon width={20} height={20} /></span>
                     <span className="nav-text">Add Transaction</span>
                   </button>
                 </li>
                           <li className="nav-item">
                   <button className="nav-link" onClick={onViewExpense}>
                     <span className="nav-icon"><EyeIcon width={20} height={20} /></span>
                     <span className="nav-text">View Transactions</span>
                   </button>
                 </li>
          <li className="nav-item">
            <button className="nav-link" onClick={onAccount}>
              <span className="nav-icon"><CreditCardIcon width={20} height={20} /></span>
              <span className="nav-text">Account</span>
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link" onClick={onReportGenerate}>
              <span className="nav-icon"><ChartIcon width={20} height={20} /></span>
              <span className="nav-text">Report Generate</span>
            </button>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <div className="footer-text">© 2025 Expense Tracker</div>
      </div>
    </div>
  );
}

export default Sidebar;
