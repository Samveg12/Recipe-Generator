import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    email: '',
    first_name: '',
    last_name: '',
    age: '',
    sex: '',
    dietary_preferences: [],
    favorite_cuisines: [],
    culinary_interests: []
  });
  const [formData, setFormData] = useState({...userProfile});

  const dietaryOptions = [
    'Vegetarian', 'Vegan', 'Pescatarian', 'Gluten-Free',
    'Dairy-Free', 'Keto', 'Paleo', 'Low-Carb'
  ];

  const cuisineOptions = [
    'Italian', 'Chinese', 'Mexican', 'Indian',
    'Japanese', 'Thai', 'Mediterranean', 'American',
    'French', 'Korean', 'Middle Eastern', 'Vietnamese'
  ];

  const experienceOptions = [
    'Beginner', 'Intermediate', 'Advanced', 'Professional'
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserProfile();
  }, [navigate]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/user/profile/', {
        headers: {
          'Authorization': token
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setUserProfile(data);
        setFormData(data);
      } else {
        console.error('Failed to fetch profile:', data.error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Create a clean version of formData with only the selected preferences
      const updatedData = {
        ...formData,
        dietary_preferences: formData.dietary_preferences || [],
        favorite_cuisines: formData.favorite_cuisines || [],
        culinary_interests: formData.culinary_interests || []
      };

      const response = await fetch('http://localhost:8000/api/user/profile/update/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(updatedData)
      });
      
      const data = await response.json();
      if (response.ok) {
        // Update the userProfile state with exactly what we sent to the server
        setUserProfile(updatedData);
        setEditing(false);
        // Fetch fresh data from server to ensure we're in sync
        fetchUserProfile();
      } else {
        console.error('Failed to update profile:', data.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePreferenceChange = (type, value) => {
    setFormData(prev => {
      const preferences = prev[type] || [];
      // If the value is already selected, remove it
      if (preferences.includes(value)) {
        return {
          ...prev,
          [type]: preferences.filter(pref => pref !== value)
        };
      }
      // If the value is not selected, add it to existing selections
      return {
        ...prev,
        [type]: [...preferences, value]
      };
    });
  };

  const handleMultiplePreferences = (type, value) => {
    setFormData(prev => {
      const preferences = prev[type] || [];
      if (preferences.includes(value)) {
        return {
          ...prev,
          [type]: preferences.filter(pref => pref !== value)
        };
      }
      return {
        ...prev,
        [type]: [...preferences, value]
      };
    });
  };

  // Add a function to handle entering edit mode
  const handleEditClick = () => {
    // Start with a clean slate for preferences
    setFormData(prev => ({
      ...prev,
      dietary_preferences: [],
      favorite_cuisines: [],
      culinary_interests: []
    }));
    setEditing(true);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your preferences and settings</p>
        </div>

        <div className="profile-card">
          <div className="profile-section user-info">
            <div className="section-header">
              <h2>Account Information</h2>
              {!editing && (
                <button className="edit-btn" onClick={handleEditClick}>
                  Edit Profile
                </button>
              )}
            </div>
            {editing ? (
              <div className="user-details-form">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={formData.first_name || ''}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name || ''}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Sex</label>
                  <select
                    value={formData.sex || ''}
                    onChange={(e) => setFormData({...formData, sex: e.target.value})}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="user-details">
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Name:</strong> {userProfile.first_name} {userProfile.last_name}</p>
                <p><strong>Age:</strong> {userProfile.age}</p>
                <p><strong>Sex:</strong> {userProfile.sex}</p>
              </div>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="profile-section">
                <h3>Dietary Preferences</h3>
                <div className="preferences-grid">
                  {dietaryOptions.map(option => (
                    <label key={option} className="preference-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.dietary_preferences?.includes(option)}
                        onChange={() => handlePreferenceChange('dietary_preferences', option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="profile-section">
                <h3>Favorite Cuisines</h3>
                <div className="preferences-grid">
                  {cuisineOptions.map(cuisine => (
                    <label key={cuisine} className="preference-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.favorite_cuisines?.includes(cuisine)}
                        onChange={() => handlePreferenceChange('favorite_cuisines', cuisine)}
                      />
                      {cuisine}
                    </label>
                  ))}
                </div>
              </div>

              <div className="profile-section">
                <h3>Cooking Experience</h3>
                <div className="experience-options">
                  {experienceOptions.map(level => (
                    <label key={level} className="experience-radio">
                      <input
                        type="radio"
                        name="cookingExperience"
                        value={level}
                        checked={formData.culinary_interests[0] === level}
                        onChange={(e) => setFormData({...formData, culinary_interests: [e.target.value]})}
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => {
                  setEditing(false);
                  setFormData(userProfile);
                }}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-section">
                <h3>Dietary Preferences</h3>
                <div className="preferences-display">
                  {userProfile.dietary_preferences?.length > 0 ? (
                    <div className="preferences-tags">
                      {userProfile.dietary_preferences.map(pref => (
                        <span key={pref} className="preference-tag">{pref}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="no-preferences">No dietary preferences set</p>
                  )}
                </div>
              </div>

              <div className="profile-section">
                <h3>Favorite Cuisines</h3>
                <div className="preferences-display">
                  {userProfile.favorite_cuisines?.length > 0 ? (
                    <div className="preferences-tags">
                      {userProfile.favorite_cuisines.map(cuisine => (
                        <span key={cuisine} className="preference-tag">{cuisine}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="no-preferences">No cuisine preferences set</p>
                  )}
                </div>
              </div>

              <div className="profile-section">
                <h3>Cooking Experience</h3>
                <div className="experience-display">
                  {userProfile.culinary_interests?.length > 0 ? (
                    <span className="experience-tag">{userProfile.culinary_interests[0]}</span>
                  ) : (
                    <p className="no-preferences">No experience level set</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
