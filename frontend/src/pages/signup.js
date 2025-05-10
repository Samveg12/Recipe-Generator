import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/signup.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    sex: '',
    dietaryPreferences: [],
    favoriteCuisines: [],
    culinaryInterests: []
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleTag = (field, value) => {
    const current = formData[field];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const res = await fetch("http://localhost:8000/api/signup/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        age: formData.age,
        sex: formData.sex,
        dietary_preferences: formData.dietaryPreferences,
        favorite_cuisines: formData.favoriteCuisines,
        culinary_interests: formData.culinaryInterests
      })
    });

    const data = await res.json();
    if (res.ok) {
      navigate('/login');
    } else {
      setError(data.error || "Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h1>CulinaryMuse</h1>
        <h2>Join Our Culinary Community</h2>

        {error && <p className="error-message">{error}</p>}

        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-group">
          <label>Age</label>
          <input name="age" type="number" min="13" value={formData.age} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Sex</label>
          <select name="sex" value={formData.sex} onChange={handleChange} required>
            <option value="">Select your sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div className="preference-section">
          <h3>Dietary Requirements</h3>
          <p className="preference-description">Select any dietary restrictions or preferences you have</p>
          <div className="dietary-restrictions">
            {["vegetarian", "vegan", "pescatarian", "gluten-free", "dairy-free", "keto", "paleo"].map(tag => (
              <div key={tag} className="dietary-option">
                <input
                  type="checkbox"
                  id={`dietary-${tag}`}
                  checked={formData.dietaryPreferences.includes(tag)}
                  onChange={() => toggleTag('dietaryPreferences', tag)}
                />
                <label htmlFor={`dietary-${tag}`}>
                  {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="preference-section">
          <h3>Favorite Cuisines</h3>
          <p className="preference-description">Choose the cuisines you enjoy the most</p>
          <div className="cuisine-preferences">
            {["italian", "indian", "chinese", "mexican", "thai", "mediterranean", "japanese", "french"].map(tag => (
              <div key={tag} className="cuisine-option">
                <input
                  type="checkbox"
                  id={`cuisine-${tag}`}
                  checked={formData.favoriteCuisines.includes(tag)}
                  onChange={() => toggleTag('favoriteCuisines', tag)}
                />
                <label htmlFor={`cuisine-${tag}`}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="preference-section">
          <h3>Culinary Interests</h3>
          <p className="preference-description">Select your cooking interests and preferences</p>
          <div className="toggle-container">
            {["cooking", "baking", "healthy", "desserts", "quick", "meal-prep"].map(tag => (
              <div key={tag} className="toggle-option">
                <input
                  type="checkbox"
                  id={`interest-${tag}`}
                  checked={formData.culinaryInterests.includes(tag)}
                  onChange={() => toggleTag('culinaryInterests', tag)}
                />
                <label htmlFor={`interest-${tag}`}>
                  {tag.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary">
          <i className="fas fa-user-plus"></i> Create Account
        </button>
      </form>
    </div>
  );
}

