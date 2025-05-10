import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/signup.css';

export default function Navbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar" style={{
      backgroundColor: 'rgba(34, 40, 49, 0.95)',
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 999
    }}>
      <Link to="/" style={{ color: 'var(--secondary-color)', fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>
        CulinaryMuse
      </Link>
      <div className="nav-links" style={{ display: 'flex', gap: '20px' }}>
        <Link to="/chat" style={{ color: 'white', textDecoration: 'none' }}>Chat</Link>
        <Link to="/saved" style={{ color: 'white', textDecoration: 'none' }}>Saved Recipes</Link>
        <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</Link>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
      </div>
    </nav>
  );
}
