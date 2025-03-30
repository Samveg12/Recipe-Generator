# Recipe Assistant Web Application

A multi-page web application for a chat-based recipe assistant.

## Overview

This web application provides users with a chat-based interface to discover, save, and share recipes. Users can engage with an AI assistant to find recipes, save their favorites, participate in a community of recipe creators, and manage their dietary preferences.

## Pages

1. **Login & Sign Up**
   - User authentication
   - New account creation
   - Multi-step onboarding form for collecting user preferences

2. **Chat-Based Recipe Assistant**
   - Interactive chat interface with AI assistant
   - Recipe suggestions and guidance
   - Chat history browsing

3. **View Past Conversations**
   - Saved chat history
   - Quick access to previous recipe discussions

4. **Recipe Bookmarking (Liked Recipes)**
   - Collection of saved recipes
   - Detailed recipe pages with ingredients and instructions

5. **Community Recipe Sharing**
   - User-submitted recipes displayed in a blog-style layout
   - Rating and commenting system
   - Profile pages for community members

6. **User Profile / Dashboard**
   - Personal information management
   - Dietary preferences and restrictions
   - Recipe preferences

## Technology Stack

- HTML5
- CSS3 (with modern features like CSS variables, Flexbox, and Grid)
- Vanilla JavaScript (ES6+)
- Font Awesome for icons
- Responsive design for mobile and desktop

## Features

- Modern, clean UI design
- Mobile-responsive layouts
- Interactive components
- Form validation
- Chat interface
- Recipe cards with ratings and details
- User profile management
- Multi-step forms with progress indicators

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Log in with any credentials (demo mode)
4. Explore the various features of the application

## Folder Structure

```
/
├── index.html        # Login page
├── signup.html       # Sign up page
├── onboarding.html   # Preference collection
├── chat.html         # Chat interface
├── liked-recipes.html # Saved recipes
├── recipe-detail.html # Single recipe view
├── community.html    # Community recipes
├── community-recipe.html # Community recipe view
├── profile.html      # User profile
├── css/              # Stylesheet files
│   ├── reset.css     # CSS reset
│   ├── variables.css # CSS variables
│   ├── layout.css    # Layout styles
│   ├── components.css # Reusable components
│   ├── pages.css     # Page-specific styles
│   └── styles.css    # Main stylesheet
└── js/               # JavaScript files
    └── app.js        # Main application logic
```

## Next Steps

- Integrate with a backend service
- Implement actual user authentication
- Connect to a recipe database
- Implement AI functionality for the recipe assistant
- Add more interactive features for community engagement 