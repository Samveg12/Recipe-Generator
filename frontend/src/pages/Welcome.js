// src/pages/Welcome.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/welcome.css';

export default function Welcome() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "💬",
      title: "AI Recipe Chat",
      description: "Get personalized recipe suggestions and cooking guidance through our AI-powered chat interface.",
      link: "/chat",
      linkText: "Start Chatting"
    },
    {
      icon: "📚",
      title: "Recipe Collection",
      description: "Save and organize your favorite recipes in one place for easy access anytime.",
      link: "/saved",
      linkText: "View Recipes"
    },
    {
      icon: "👤",
      title: "Personalized Profile",
      description: "Create your culinary profile with dietary preferences, favorite cuisines, and cooking interests.",
      link: "/profile",
      linkText: "Set Up Profile"
    }
  ];

  return (
    <div className="welcome-container">
      <section className="hero-section">
        <h1 className="hero-title">Welcome to CulinaryMuse 🍽️</h1>
        <p className="hero-subtitle">
          Your AI-powered culinary companion that helps you discover, create, and enjoy amazing recipes tailored to your preferences.
        </p>
      </section>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h2 className="feature-title">{feature.title}</h2>
            <p className="feature-description">{feature.description}</p>
            <a href={feature.link} className="feature-link">
              {feature.linkText}
            </a>
          </div>
        ))}
      </div>

    </div>
  );
}
