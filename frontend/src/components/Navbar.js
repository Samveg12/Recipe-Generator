import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/navbar.css';
import logoDark from '../img/logo-dark.svg';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const isAuthenticated = localStorage.getItem('token');

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <img src={logoDark} alt="CulinaryMuse Logo" className="navbar-logo" />
                <h1 className="navbar-title">CulinaryMuse</h1>
            </Link>

            <button className="menu-button" onClick={toggleMenu}>
                <i className={`fas fa-${isMenuOpen ? 'times' : 'bars'}`}></i>
            </button>

            <div className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                <Link 
                    to="/" 
                    className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                >
                    Home
                </Link>
                <Link 
                    to="/chat" 
                    className={`nav-link ${location.pathname === '/chat' ? 'active' : ''}`}
                >
                    Chat
                </Link>
                <Link 
                    to="/community" 
                    className={`nav-link ${location.pathname === '/community' ? 'active' : ''}`}
                >
                    Community
                </Link>
                {isAuthenticated ? (
                    <>
                        <Link 
                            to="/saved" 
                            className={`nav-link ${location.pathname === '/saved' ? 'active' : ''}`}
                        >
                            Saved Recipes
                        </Link>
                        <Link 
                            to="/profile" 
                            className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
                        >
                            Profile
                        </Link>
                        <button onClick={handleLogout} className="nav-button secondary">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-button secondary">
                            Login
                        </Link>
                        <Link to="/signup" className="nav-button">
                            Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar; 