import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/signup.css'; // reusing the same CSS for styling
import logoDark from '../img/logo-dark.svg';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/api/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      navigate("/chat");
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form login-form">
        <div className="logo-section">
          <img src={logoDark} alt="CulinaryMuse Logo" className="app-logo" />
          <h1 className="brand-name">CulinaryMuse</h1>
          <h2 className="welcome-text">Welcome Back</h2>
        </div>

        <form onSubmit={handleSubmit} className="form-section">
          {error && <p className="error-message">{error}</p>}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn-primary">
            Log In
          </button>

          <div className="signup-prompt">
            <span>Don't have an account? </span>
            <a href="/signup">Sign Up</a>
          </div>
        </form>
      </div>
    </div>
  );
}

