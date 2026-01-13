import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import './SignupForm.css';

function SignupForm({ isOpen, onClose }) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(''); // 'checking', 'available', 'taken', ''
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Debounced username checking
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length >= 3) {
        setCheckingUsername(true);
        setUsernameStatus('checking');
        
        try {
          const response = await fetch(`http://localhost:8000/api/users/check-username/?username=${encodeURIComponent(formData.username)}`);
          const data = await response.json();
          
          if (response.ok) {
            if (data.available) {
              setUsernameStatus('available');
              setErrors(prev => ({ ...prev, username: '' }));
            } else {
              setUsernameStatus('taken');
              setErrors(prev => ({ ...prev, username: 'Username already exists. Please choose a different username.' }));
            }
          }
        } catch (error) {
          console.error('Username check error:', error);
          setUsernameStatus('');
        } finally {
          setCheckingUsername(false);
        }
      } else {
        setUsernameStatus('');
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500); // Debounce for 500ms
    return () => clearTimeout(timeoutId);
  }, [formData.username]);

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

    // Reset username status when username changes
    if (name === 'username') {
      setUsernameStatus('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (usernameStatus === 'taken') {
      newErrors.username = 'Username already exists. Please choose a different username.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Don't submit if username is still being checked or is taken
    if (checkingUsername || usernameStatus === 'taken') {
      return;
    }

    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8000/api/users/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            confirm_password: formData.confirmPassword
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Registration successful - automatically log in the user
          login(data.user);
          alert('Signup successful! Welcome to Expense Tracker.');
          onClose();
          setFormData({ username: '', password: '', confirmPassword: '' });
          setUsernameStatus('');
        } else {
          // Handle specific error messages from backend
          if (data.error) {
            if (data.error === 'User with this username already exists') {
              setErrors({ username: 'Username already exists. Please choose a different username.' });
            } else {
              alert(`Error: ${data.error}`);
            }
          } else if (data.username) {
            setErrors({ username: data.username[0] });
          } else if (data.password) {
            setErrors({ password: data.password[0] });
          } else if (data.confirm_password) {
            setErrors({ confirmPassword: data.confirm_password[0] });
          } else {
            alert('An error occurred during signup. Please try again.');
          }
        }
      } catch (error) {
        console.error('Signup error:', error);
        alert('Network error. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({ username: '', password: '', confirmPassword: '' });
    setErrors({});
    setUsernameStatus('');
    setCheckingUsername(false);
    onClose();
  };

  const getUsernameInputClass = () => {
    let className = '';
    if (errors.username) {
      className += 'error ';
    }
    if (usernameStatus === 'available') {
      className += 'success ';
    } else if (usernameStatus === 'taken') {
      className += 'error ';
    }
    return className.trim();
  };

  const getUsernameStatusMessage = () => {
    if (checkingUsername) {
      return <span className="status-message checking">Checking availability...</span>;
    }
    if (usernameStatus === 'available') {
      return <span className="status-message available">✓ Username is available</span>;
    }
    if (usernameStatus === 'taken') {
      return <span className="error-message">Username already exists. Please choose a different username.</span>;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Account</h2>
          <button className="close-button" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={getUsernameInputClass()}
              placeholder="Enter your username"
              disabled={isLoading}
            />
            {errors.username && <span className="error-message">{errors.username}</span>}
            {!errors.username && getUsernameStatusMessage()}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={handleClose} disabled={isLoading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={isLoading || checkingUsername || usernameStatus === 'taken'}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
