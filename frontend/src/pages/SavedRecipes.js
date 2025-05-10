import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/savedRecipes.css';

const SavedRecipes = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const [postData, setPostData] = useState({ title: '', content: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchSavedRecipes();
  }, [navigate]);

  const fetchSavedRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/saved-recipes/', {
        headers: {
          'Authorization': token
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setRecipes(data || []);
      } else {
        console.error('Failed to fetch saved recipes:', data.error);
      }
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (recipeId, isFavorited) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/toggle-favorite/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          id: recipeId,
          favorited: !isFavorited
        })
      });
      
      if (response.ok) {
        // Update recipes in state
        setRecipes(recipes.map(recipe => {
          if (recipe.id === recipeId) {
            return { ...recipe, favorited: !recipe.favorited };
          }
          return recipe;
        }));

        // Also update selected recipe if it's the one being toggled
        if (selectedRecipe && selectedRecipe.id === recipeId) {
          setSelectedRecipe({ ...selectedRecipe, favorited: !selectedRecipe.favorited });
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteRecipe = async (recipeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/delete-recipe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ id: recipeId })
      });
      
      if (response.ok) {
        // Remove recipe from state
        setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
        
        // Close detail view if the deleted recipe was selected
        if (selectedRecipe && selectedRecipe.id === recipeId) {
          setSelectedRecipe(null);
        }
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const shareToCommmunity = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/community/posts/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          title: postData.title,
          content: postData.content,
          recipe_id: selectedRecipe.id
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        setShareModal(false);
        setPostData({ title: '', content: '' });
        
        // Navigate to community page
        navigate('/community');
      } else {
        console.error('Failed to share recipe:', data.error);
      }
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  const viewRecipeDetails = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const openShareModal = (recipe) => {
    setSelectedRecipe(recipe);
    setPostData({
      title: `Recipe: ${recipe.title}`,
      content: `I wanted to share this recipe with the community!`
    });
    setShareModal(true);
  };

  return (
    <div className="saved-recipes-container">
      <div className="saved-recipes-content">
        <div className="saved-recipes-header">
          <h1>My Saved Recipes</h1>
          <p>Manage your recipe collection</p>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading your recipes...</div>
        ) : recipes.length === 0 ? (
          <div className="no-recipes">
            <h3>No saved recipes yet</h3>
            <p>Ask the AI in the Chat section for recipe suggestions and save them here!</p>
            <button onClick={() => navigate('/chat')} className="primary-btn">
              Go to Chat
            </button>
          </div>
        ) : (
          <div className="recipes-list">
            {recipes.map(recipe => (
              <div key={recipe.id} className="recipe-card">
                <h3 className="recipe-title">{recipe.title}</h3>
                <div className="recipe-ingredients-preview">
                  <p><strong>Ingredients:</strong> {recipe.ingredients.slice(0, 3).join(', ')}{recipe.ingredients.length > 3 ? '...' : ''}</p>
                </div>
                <div className="recipe-actions">
                  <button 
                    className="view-btn"
                    onClick={() => viewRecipeDetails(recipe)}
                  >
                    View Recipe
                  </button>
                  <button 
                    className={`favorite-btn ${recipe.favorited ? 'favorited' : ''}`}
                    onClick={() => toggleFavorite(recipe.id, recipe.favorited)}
                  >
                    {recipe.favorited ? '★' : '☆'}
                  </button>
                  <button 
                    className="share-btn"
                    onClick={() => openShareModal(recipe)}
                  >
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => !shareModal && setSelectedRecipe(null)}>
          <div className="modal-content recipe-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="recipe-detail-title">
                <h2>{selectedRecipe.title}</h2>
                <button 
                  className={`favorite-btn large ${selectedRecipe.favorited ? 'favorited' : ''}`}
                  onClick={() => toggleFavorite(selectedRecipe.id, selectedRecipe.favorited)}
                >
                  {selectedRecipe.favorited ? '★' : '☆'}
                </button>
              </div>
              <button className="close-btn" onClick={() => setSelectedRecipe(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="recipe-detail-section">
                <h3>Ingredients</h3>
                <ul className="ingredients-list">
                  {selectedRecipe.ingredients.map((ingredient, idx) => (
                    <li key={idx}>{ingredient}</li>
                  ))}
                </ul>
              </div>
              <div className="recipe-detail-section">
                <h3>Instructions</h3>
                <div className="instructions-text">
                  {selectedRecipe.instructions}
                </div>
              </div>
              <div className="recipe-detail-actions">
                <button 
                  className="share-community-btn"
                  onClick={() => openShareModal(selectedRecipe)}
                >
                  Share to Community
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this recipe?')) {
                      deleteRecipe(selectedRecipe.id);
                    }
                  }}
                >
                  Delete Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share to Community Modal */}
      {shareModal && (
        <div className="modal-overlay">
          <div className="modal-content share-modal">
            <div className="modal-header">
              <h2>Share to Community</h2>
              <button className="close-btn" onClick={() => setShareModal(false)}>×</button>
            </div>
            <form onSubmit={shareToCommmunity}>
              <div className="form-group">
                <label htmlFor="postTitle">Title</label>
                <input
                  type="text"
                  id="postTitle"
                  value={postData.title}
                  onChange={(e) => setPostData({...postData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="postContent">Message (optional)</label>
                <textarea
                  id="postContent"
                  value={postData.content}
                  onChange={(e) => setPostData({...postData, content: e.target.value})}
                  rows={4}
                ></textarea>
              </div>
              <div className="recipe-preview">
                <h4>Recipe to share: {selectedRecipe.title}</h4>
                <p><small>Ingredients: {selectedRecipe.ingredients.slice(0, 3).join(', ')}{selectedRecipe.ingredients.length > 3 ? '...' : ''}</small></p>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShareModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Share to Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedRecipes;
