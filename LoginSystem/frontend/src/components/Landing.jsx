import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import './Landing.css';

function Landing() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!userData || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="landing-container">
      <nav className="navbar">
        <h1>My Application</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>

      <div className="welcome-section">
        <h2>Welcome, {user.username}!</h2>
        <p>You have successfully logged into the application.</p>
        
        <div className="user-info">
          <h3>Your Profile Information:</h3>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </div>

        <div className="features">
          <h3>What you can do now:</h3>
          <ul>
            <li>✓ You are successfully authenticated</li>
            <li>✓ Your session is protected with JWT</li>
            <li>✓ You can make authenticated API calls</li>
            <li>✓ Your data is securely stored</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Landing;