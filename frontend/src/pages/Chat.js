import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/chat.css';
import Markdown from 'react-markdown';

export default function Chat() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
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
    </div>
  );
}
