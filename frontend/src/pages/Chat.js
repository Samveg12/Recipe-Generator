import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/chat.css';
import Markdown from 'react-markdown';

export default function Chat() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [saveModal, setSaveModal] = useState(false);
  const [recipeData, setRecipeData] = useState({ title: '', ingredients: [], instructions: '' });
  const [savingRecipe, setSavingRecipe] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    else fetchChatHistory(token);
  }, []);

  const fetchChatHistory = async (token) => {
    const res = await fetch('http://localhost:8000/api/history/', {
      method: 'GET',
      headers: { 'Authorization': token }
    });
    if (res.ok) {
      const data = await res.json();
      setHistory(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!input || !token) return;

    setLoading(true);
    const res = await fetch('http://localhost:8000/api/chat/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();
    setLoading(false);
    if (res.ok && data.reply) {
      const newEntry = { prompt: input, response: data.reply };
      setHistory([newEntry, ...history]);
      setInput('');
      setSelectedEntry(newEntry);
      scrollToBottom();
    }
  };

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleNewChat = () => {
    setSelectedEntry(null);
    setInput('');
  };

  const parseRecipe = (responseText) => {
    // A basic recipe parser - this is a simplified version
    // In a production app, consider using NLP or regex patterns for more precise extraction
    
    // Look for title patterns
    let title = '';
    const titleMatch = responseText.match(/(?:Recipe|#)\s*:\s*(.*?)(?:\n|$)/i) ||
                     responseText.match(/(?:^|\n)([^#\n][^\n]+?)(?:\n|$)/);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
    
    // Extract ingredients
    let ingredients = [];
    const ingredientsSection = responseText.match(/(?:Ingredients:|Ingredients)(?:\s*:\s*)?(?:\n?)([\s\S]*?)(?:\n\s*(?:Instructions|Directions|Method|Steps|Preparation)|$)/i);
    
    if (ingredientsSection) {
      const ingredientText = ingredientsSection[1];
      // Extract ingredients as list items
      ingredients = ingredientText.split('\n')
                              .filter(line => line.trim().length > 0)
                              .map(line => line.replace(/^[*\-•]|\d+\.\s+/g, '').trim());
    }
    
    // Extract instructions
    let instructions = '';
    const instructionsSection = responseText.match(/(?:Instructions|Directions|Method|Steps|Preparation)(?:\s*:\s*)?(?:\n?)([\s\S]*?)(?:\n\s*(?:Notes|Tips|Enjoy|$))/i);
    
    if (instructionsSection) {
      instructions = instructionsSection[1].trim();
    } else {
      // If no explicit instructions section, take the remainder after ingredients
      const remainderAfterIngredients = responseText.split(/Ingredients(?:\s*:\s*)?/i)[1];
      if (remainderAfterIngredients) {
        const remainingParts = remainderAfterIngredients.split('\n\n');
        if (remainingParts.length > 1) {
          instructions = remainingParts.slice(1).join('\n\n').trim();
        }
      }
    }
    
    return {
      title: title || 'Untitled Recipe',
      ingredients: ingredients.length > 0 ? ingredients : ['Ingredients not found'],
      instructions: instructions || 'Instructions not found'
    };
  };

  const openSaveModal = () => {
    if (!selectedEntry) return;
    
    const parsedRecipe = parseRecipe(selectedEntry.response);
    setRecipeData(parsedRecipe);
    setSaveModal(true);
    setSaveSuccess(false);
  };

  const handleSaveRecipe = async (e) => {
    e.preventDefault();
    
    if (!recipeData.title || recipeData.ingredients.length === 0) {
      alert('Please provide a title and at least one ingredient');
      return;
    }
    
    setSavingRecipe(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/save-recipe/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(recipeData)
      });
      
      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveModal(false);
          setSaveSuccess(false);
        }, 2000);
      } else {
        alert('Failed to save recipe. Please try again.');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('An error occurred while saving the recipe');
    } finally {
      setSavingRecipe(false);
    }
  };

  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...recipeData.ingredients];
    updatedIngredients[index] = value;
    setRecipeData({...recipeData, ingredients: updatedIngredients});
  };

  const addIngredient = () => {
    setRecipeData({
      ...recipeData, 
      ingredients: [...recipeData.ingredients, '']
    });
  };

  const removeIngredient = (index) => {
    const updatedIngredients = [...recipeData.ingredients];
    updatedIngredients.splice(index, 1);
    setRecipeData({...recipeData, ingredients: updatedIngredients});
  };

  return (
    <div className="main-content">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <span className="history-label">🧾 Chat History</span>
          </div>
          <button className="new-recipe-btn" onClick={handleNewChat}>
            <span className="plus-icon">+</span>
            New Recipe
          </button>
        </div>
        <div className="chat-history">
          {history.map((entry, idx) => (
            <div key={idx} className={`chat-item ${selectedEntry === entry ? 'active' : ''}`} onClick={() => handleEntryClick(entry)}>
              <div className="chat-icon">💬</div>
              <div className="chat-info">
                <div className="chat-title">{entry.prompt.slice(0, 30)}...</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-title">
            <h3>🍳 CulinaryMuse Assistant</h3>
            <p className="chat-subtitle">Helping you cook smarter</p>
          </div>
          {selectedEntry && (
            <button className="save-recipe-btn" onClick={openSaveModal}>
              Save Recipe
            </button>
          )}
        </div>

        <div className="chat-messages">
          {selectedEntry ? (
            <>
              <div className="message user-message">
                <div className="message-content">
                  <p>{selectedEntry.prompt}</p>
                </div>
              </div>
              <div className="message assistant-message">
                <div className="message-content">
                  <Markdown>{selectedEntry.response}</Markdown>
                </div>
              </div>
            </>
          ) : (
            <div className="welcome-message">
              <h2>Welcome to CulinaryMuse! 👋</h2>
              <p>I'm your AI cooking assistant, ready to help you create delicious recipes and answer your culinary questions.</p>
              <p>Try asking me about:</p>
              <div className="examples">
                <span onClick={() => setInput("What can I make with chicken, rice, and broccoli?")}>
                  What can I make with chicken, rice, and broccoli?
                </span>
                <span onClick={() => setInput("Give me a healthy dinner recipe for two")}>
                  Give me a healthy dinner recipe for two
                </span>
                <span onClick={() => setInput("How do I make the perfect pasta sauce?")}>
                  How do I make the perfect pasta sauce?
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <form className="chat-input-wrapper" onSubmit={handleSubmit}>
            <textarea
              id="chatInput"
              placeholder="Type ingredients or a cooking question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              required
            ></textarea>
            <button type="submit" className="send-btn" disabled={loading}>
              ➤
            </button>
          </form>
        </div>
      </div>

      {/* Save Recipe Modal */}
      {saveModal && (
        <div className="modal-overlay">
          <div className="modal-content save-recipe-modal">
            <div className="modal-header">
              <h2>Save Recipe</h2>
              <button className="close-btn" onClick={() => setSaveModal(false)}>×</button>
            </div>
            {saveSuccess ? (
              <div className="save-success">
                <div className="success-icon">✓</div>
                <h3>Recipe Saved!</h3>
                <p>You can view it in your Saved Recipes.</p>
              </div>
            ) : (
              <form onSubmit={handleSaveRecipe}>
                <div className="form-group">
                  <label htmlFor="recipeTitle">Recipe Title</label>
                  <input
                    type="text"
                    id="recipeTitle"
                    value={recipeData.title}
                    onChange={(e) => setRecipeData({...recipeData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Ingredients</label>
                  <div className="ingredients-editor">
                    {recipeData.ingredients.map((ingredient, idx) => (
                      <div key={idx} className="ingredient-row">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => handleIngredientChange(idx, e.target.value)}
                          placeholder="e.g. 2 cups flour"
                        />
                        <button
                          type="button"
                          className="remove-ingredient"
                          onClick={() => removeIngredient(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-ingredient-btn"
                      onClick={addIngredient}
                    >
                      + Add Ingredient
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="recipeInstructions">Instructions</label>
                  <textarea
                    id="recipeInstructions"
                    value={recipeData.instructions}
                    onChange={(e) => setRecipeData({...recipeData, instructions: e.target.value})}
                    rows={6}
                    required
                  ></textarea>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setSaveModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn" disabled={savingRecipe}>
                    {savingRecipe ? 'Saving...' : 'Save Recipe'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
