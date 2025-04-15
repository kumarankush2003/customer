import React, { useState } from 'react';
import './App.css';
import CategoryView from './components/CategoryView';
import Login from './components/Login';
import ProfileSignup from './components/ProfileSignup';
import ServiceForm from './components/ServiceForm';

function App() {
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setIsNewUser(false);
  };

  return (
    <div className="app-container">
      <h1 className="title">Customer Service Platform</h1>
      {!user ? (
        <Login setUser={setUser} setIsNewUser={setIsNewUser} />
      ) : isNewUser ? (
        <ProfileSignup user={user} onComplete={() => setIsNewUser(false)} />
      ) : (
        <div className="user-section">
          <p>Welcome, {user.name || user.email}</p>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
          <ServiceForm user={user} />
          <CategoryView category="General Queries" />
          <CategoryView category="Product Features Queries" />
          <CategoryView category="Product Pricing Queries" />
          <CategoryView category="Product Feature Implementation Requests" />
        </div>
      )}
    </div>
  );
}

export default App;
