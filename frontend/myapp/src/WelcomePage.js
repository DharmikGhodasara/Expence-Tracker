import React from 'react';
import './WelcomePage.css';

function WelcomePage() {
  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1>Welcome to Expense Tracker</h1>
        <p>Track your expenses and manage your finances efficiently</p>
        <div className="welcome-cta">
          <p>Get started by creating an account or logging in</p>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;
