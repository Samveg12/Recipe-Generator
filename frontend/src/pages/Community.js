import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/community.css';

const Community = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostModal, setNewPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    fetchPosts();
    fetchUserRecipes();
  }, [navigate]);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/community/posts/', {
        headers: {
          'Authorization': token
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts || []);
      } else {
        console.error('Failed to fetch posts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/saved-recipes/', {
        headers: {
          'Authorization': token
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setUserRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const postData = {
        ...newPost,
        recipe_id: selectedRecipe
      };
      
      const response = await fetch('http://localhost:8000/api/community/posts/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(postData)
      });
      
      const data = await response.json();
      if (response.ok) {
        setNewPostModal(false);
        setNewPost({ title: '', content: '' });
        setSelectedRecipe(null);
        fetchPosts();
      } else {
        console.error('Failed to create post:', data.error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/community/posts/like/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ post_id: postId })
      });
      
      const data = await response.json();
      if (response.ok) {
        // Update post likes in the UI
        setPosts(posts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              likes: data.likes_count,
              liked_by_current_user: data.liked
            };
          }
          return post;
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const viewPostDetails = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/community/posts/${postId}/`, {
        headers: {
          'Authorization': token
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setSelectedPost(data.post);
      } else {
        console.error('Failed to fetch post details:', data.error);
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  const submitComment = async () => {
    if (!comment.trim() || !selectedPost) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/community/comments/add/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          post_id: selectedPost.id,
          content: comment
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        // Add new comment to UI
        setSelectedPost({
          ...selectedPost,
          comments: [
            ...selectedPost.comments,
            {
              id: data.comment_id,
              content: comment,
              created_at: data.created_at,
              user_email: data.user_email
            }
          ]
        });
        setComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="community-container">
      {/* Main Content */}
      <div className="community-content">
        <div className="community-header">
          <h1>Community Recipes</h1>
          <p>Connect with fellow food enthusiasts and share your culinary creations</p>
          <button 
            className="create-post-btn"
            onClick={() => setNewPostModal(true)}
          >
            Share a Recipe
          </button>
        </div>

        {/* Posts List */}
        <div className="posts-container">
          {loading ? (
            <div className="loading-spinner">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="no-posts">
              <h3>No community posts yet</h3>
              <p>Be the first to share a recipe with the community!</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    <div className="author-avatar">
                      {post.user_email.charAt(0).toUpperCase()}
                    </div>
                    <div className="author-info">
                      <h4>{post.user_email}</h4>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </div>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-content">{post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}</p>
                {post.recipe && (
                  <div className="post-recipe-tag">
                    🍽️ Recipe: {post.recipe.title}
                  </div>
                )}
                <div className="post-actions">
                  <button 
                    className={`like-button ${post.liked_by_current_user ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    {post.liked_by_current_user ? '❤️' : '🤍'} {post.likes}
                  </button>
                  <button 
                    className="comment-button"
                    onClick={() => viewPostDetails(post.id)}
                  >
                    💬 {post.comments_count || 0} Comments
                  </button>
                  <button 
                    className="view-button"
                    onClick={() => viewPostDetails(post.id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Post Modal */}
      {newPostModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Share with the Community</h2>
              <button className="close-btn" onClick={() => setNewPostModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label htmlFor="postTitle">Title</label>
                <input
                  type="text"
                  id="postTitle"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  placeholder="E.g., My Amazing Pasta Recipe"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="postContent">Content</label>
                <textarea
                  id="postContent"
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  placeholder="Share your cooking experience, tips, or thoughts..."
                  rows={5}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="recipeSelect">Attach a Recipe (Optional)</label>
                <select
                  id="recipeSelect"
                  value={selectedRecipe || ''}
                  onChange={(e) => setSelectedRecipe(e.target.value || null)}
                >
                  <option value="">-- Select a Recipe --</option>
                  {userRecipes.map(recipe => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setNewPostModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="modal-overlay">
          <div className="modal-content post-details-modal">
            <div className="modal-header">
              <h2>{selectedPost.title}</h2>
              <button className="close-btn" onClick={() => setSelectedPost(null)}>×</button>
            </div>
            <div className="post-details-content">
              <div className="post-author-details">
                <div className="author-avatar large">
                  {selectedPost.user_email.charAt(0).toUpperCase()}
                </div>
                <div className="author-info">
                  <h4>{selectedPost.user_email}</h4>
                  <span>{formatDate(selectedPost.created_at)}</span>
                </div>
              </div>
              <p className="post-content-full">{selectedPost.content}</p>
              
              {selectedPost.recipe && (
                <div className="attached-recipe">
                  <h3>🍽️ {selectedPost.recipe.title}</h3>
                  <div className="recipe-details">
                    <div className="ingredients">
                      <h4>Ingredients:</h4>
                      <ul>
                        {selectedPost.recipe.ingredients.map((ingredient, idx) => (
                          <li key={idx}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="instructions">
                      <h4>Instructions:</h4>
                      <p>{selectedPost.recipe.instructions}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="post-actions details-actions">
                <button 
                  className={`like-button large ${selectedPost.liked_by_current_user ? 'liked' : ''}`}
                  onClick={() => handleLike(selectedPost.id)}
                >
                  {selectedPost.liked_by_current_user ? '❤️' : '🤍'} {selectedPost.likes}
                </button>
              </div>
              
              <div className="comments-section">
                <h3>Comments</h3>
                <div className="comments-list">
                  {selectedPost.comments.length === 0 ? (
                    <p className="no-comments">No comments yet. Be the first to comment!</p>
                  ) : (
                    selectedPost.comments.map(comment => (
                      <div key={comment.id} className="comment">
                        <div className="comment-header">
                          <div className="comment-avatar">
                            {comment.user_email.charAt(0).toUpperCase()}
                          </div>
                          <div className="comment-info">
                            <h4>{comment.user_email}</h4>
                            <span>{formatDate(comment.created_at)}</span>
                          </div>
                        </div>
                        <p className="comment-content">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="add-comment">
                  <textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                  <button onClick={submitComment}>Post</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community; 