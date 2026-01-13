import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import SignupForm from './SignupForm';
import LoginForm from './LoginForm';
import './Navbar.css';
import { MenuIcon, UserIcon, LogoutIcon } from './icons';

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const handleSignupClick = () => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
  };

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
  };

  const handleCloseSignup = () => {
    setIsSignupOpen(false);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            {user && (
              <button
                className="menu-btn"
                aria-label="Toggle menu"
                onClick={onToggleSidebar}
              >
                <MenuIcon className="icon" />
              </button>
            )}
            <h1 className="navbar-heading">Expense Tracker</h1>
          </div>
          <div className="navbar-right">
            {!user && (
              <div className="navbar-auth">
                <button className="auth-button login-btn" onClick={handleLoginClick}>
                  <UserIcon className="icon" />
                  <span>Login</span>
                </button>
                <button className="auth-button signup-btn" onClick={handleSignupClick}>
                  <UserIcon className="icon" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}
            {user && (
              <div className="navbar-user">
                <div className="user-chip" title={user?.email || user?.username}>
                  <UserIcon className="icon" />
                  <span className="user-name">{user?.username}</span>
                </div>
                <button className="auth-button logout-btn" onClick={logout}>
                  <LogoutIcon className="icon" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isSignupOpen && (
        <SignupForm 
          isOpen={isSignupOpen} 
          onClose={handleCloseSignup}
        />
      )}

      {isLoginOpen && (
        <LoginForm 
          isOpen={isLoginOpen} 
          onClose={handleCloseLogin}
        />
      )}
    </>
  );
}

export default Navbar;
