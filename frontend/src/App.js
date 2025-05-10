import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Welcome from './pages/Welcome';
import Login from './pages/login';
import Signup from './pages/signup';
import Chat from './pages/Chat';
import SavedRecipes from './pages/SavedRecipes';
import Profile from './pages/Profile';
import Community from './pages/Community';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
           <Route path="/chat" element={<Chat />} /> 
          <Route path="/saved" element={<SavedRecipes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
