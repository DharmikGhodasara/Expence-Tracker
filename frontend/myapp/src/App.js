import React, { useState } from 'react';
import './App.css';
import { AuthProvider } from './AuthContext';
import Navbar from './Navbar';
import Home from './Home';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const handleToggleSidebar = () => setIsSidebarOpen(prev => !prev);
  return (
    <div className="App">
      <Navbar onToggleSidebar={handleToggleSidebar} />
      <Home sidebarOpen={isSidebarOpen} onToggleSidebar={handleToggleSidebar} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
