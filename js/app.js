// Main Application JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components based on current page
    initPage();
    initAuth();
    initChat();
    initProfileTabs();
});

function initPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Common components initialization
    initUserMenu();
    
    // Page-specific initialization
    if (currentPage === 'index.html' || currentPage === '') {
        initLoginForm();
    } else if (currentPage === 'signup.html') {
        initSignupForm();
    } else if (currentPage === 'onboarding.html') {
        initOnboardingForm();
    } else if (currentPage === 'chat.html') {
        initChatInterface();
    } else if (currentPage === 'recipe-detail.html' || currentPage.includes('recipe-detail.html')) {
        initRecipeDetail();
    } else if (currentPage === 'community-recipe.html' || currentPage.includes('community-recipe.html')) {
        initCommunityRecipe();
    } else if (currentPage === 'profile.html') {
        initProfilePage();
    }
}

function initUserMenu() {
    const userAvatar = document.querySelector('.user-avatar');
    const dropdown = document.querySelector('.dropdown');
    
    if (userAvatar && dropdown) {
        userAvatar.addEventListener('click', () => {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
        
        document.addEventListener('click', (event) => {
            if (!userAvatar.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
}

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simulate login - in a real app, you would make an API call
            if (email && password) {
                // Redirect to chat page after login
                window.location.href = 'chat.html';
            } else {
                alert('Please enter both email/phone and password');
            }
        });
    }
}

function initSignupForm() {
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validation
            if (!email || !password || !confirmPassword) {
                alert('Please fill in all fields');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }
            
            // Simulate signup - in a real app, you would make an API call
            window.location.href = 'onboarding.html';
        });
    }
}

function initOnboardingForm() {
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');
    const submitBtn = document.getElementById('submitBtn');
    const progressBar = document.getElementById('progress');
    const steps = document.querySelectorAll('.step');
    
    let currentStep = 0;
    updateProgress();
    
    if (nextButtons.length > 0) {
        nextButtons.forEach(button => {
            button.addEventListener('click', () => {
                const nextStepId = button.getAttribute('data-next');
                const currentStepElement = document.querySelector('.form-step.active');
                const nextStepElement = document.getElementById(nextStepId);
                
                currentStepElement.classList.remove('active');
                nextStepElement.classList.add('active');
                
                currentStep++;
                updateProgress();
            });
        });
    }
    
    if (prevButtons.length > 0) {
        prevButtons.forEach(button => {
            button.addEventListener('click', () => {
                const prevStepId = button.getAttribute('data-prev');
                const currentStepElement = document.querySelector('.form-step.active');
                const prevStepElement = document.getElementById(prevStepId);
                
                currentStepElement.classList.remove('active');
                prevStepElement.classList.add('active');
                
                currentStep--;
                updateProgress();
            });
        });
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            // Simulate form submission - in a real app, you would make an API call
            window.location.href = 'chat.html';
        });
    }
    
    function updateProgress() {
        const totalSteps = steps.length;
        const progressPercentage = (currentStep / (totalSteps - 1)) * 100;
        
        progressBar.style.width = `${progressPercentage}%`;
        
        steps.forEach((step, index) => {
            if (index <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
}

function initChatInterface() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const chatItems = document.querySelectorAll('.chat-item');
    
    if (chatInput && sendBtn && chatMessages) {
        // Auto-resize textarea
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
        
        // Send message on button click
        sendBtn.addEventListener('click', sendMessage);
        
        // Send message on Enter (but allow shift+enter for new line)
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Handle chat history selection
    if (chatItems.length > 0) {
        chatItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all items
                chatItems.forEach(i => i.classList.remove('active'));
                
                // Add active class to clicked item
                item.classList.add('active');
                
                // In a real app, you would load the selected conversation
                // This is just a simple toggle for the demo
            });
        });
    }
    
    function sendMessage() {
        const message = chatInput.value.trim();
        
        if (message) {
            // Add user message
            const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const userMessageHTML = `
                <div class="message user-message">
                    <div class="message-content">
                        <p>${message}</p>
                    </div>
                    <div class="message-time">${currentTime}</div>
                </div>
            `;
            
            chatMessages.insertAdjacentHTML('beforeend', userMessageHTML);
            chatInput.value = '';
            chatInput.style.height = 'auto';
            
            // Auto scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Simulate assistant response (in a real app, you would make an API call)
            setTimeout(() => {
                const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const assistantMessageHTML = `
                    <div class="message assistant-message">
                        <div class="assistant-avatar">
                            <img src="https://via.placeholder.com/32" alt="Assistant">
                        </div>
                        <div class="message-content">
                            <p>This is a demo response. In a real application, this would be generated by an AI assistant based on your message.</p>
                        </div>
                        <div class="message-time">${responseTime}</div>
                    </div>
                `;
                
                chatMessages.insertAdjacentHTML('beforeend', assistantMessageHTML);
                
                // Auto scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }
    }
}

function initRecipeDetail() {
    const decreaseServings = document.getElementById('decreaseServings');
    const increaseServings = document.getElementById('increaseServings');
    const servingsCount = document.getElementById('servingsCount');
    const saveButton = document.querySelector('.action-btn-large.active');
    
    if (decreaseServings && increaseServings && servingsCount) {
        let count = parseInt(servingsCount.textContent, 10);
        
        decreaseServings.addEventListener('click', () => {
            if (count > 1) {
                count--;
                servingsCount.textContent = count;
                updateIngredientAmounts(count);
            }
        });
        
        increaseServings.addEventListener('click', () => {
            count++;
            servingsCount.textContent = count;
            updateIngredientAmounts(count);
        });
    }
    
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const isSaved = saveButton.classList.contains('active');
            
            if (isSaved) {
                saveButton.classList.remove('active');
                saveButton.innerHTML = '<i class="far fa-heart"></i> Save';
            } else {
                saveButton.classList.add('active');
                saveButton.innerHTML = '<i class="fas fa-heart"></i> Saved';
            }
        });
    }
    
    function updateIngredientAmounts(newServings) {
        // This is a simple implementation - in a real app, you would calculate this properly
        // based on original serving size and ingredient quantities
        console.log(`Updated recipe for ${newServings} servings`);
    }
}

function initCommunityRecipe() {
    const ratingStars = document.querySelectorAll('.rating-input .rating-stars i');
    const saveButton = document.querySelector('.action-btn-large');
    
    if (ratingStars.length > 0) {
        let currentRating = 0;
        
        ratingStars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.getAttribute('data-rating'), 10);
                highlightStars(rating);
            });
            
            star.addEventListener('mouseleave', () => {
                highlightStars(currentRating);
            });
            
            star.addEventListener('click', () => {
                currentRating = parseInt(star.getAttribute('data-rating'), 10);
                highlightStars(currentRating);
            });
        });
        
        function highlightStars(rating) {
            ratingStars.forEach(s => {
                const starRating = parseInt(s.getAttribute('data-rating'), 10);
                
                if (starRating <= rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        }
    }
    
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const isSaved = saveButton.innerHTML.includes('Saved');
            
            if (isSaved) {
                saveButton.innerHTML = '<i class="far fa-heart"></i> Save';
            } else {
                saveButton.innerHTML = '<i class="fas fa-heart"></i> Saved';
            }
        });
    }
}

function initProfilePage() {
    const profileTabs = document.querySelectorAll('.profile-tab');
    
    if (profileTabs.length > 0) {
        profileTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                profileTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // In a real app, you would load the content for the selected tab
                // This is just a simple toggle for the demo
            });
        });
    }
}

// Profile Tabs Functionality
function initProfileTabs() {
    const profileTabs = document.querySelectorAll('.profile-tab');
    
    // Only initialize if we're on the profile page
    if (!profileTabs.length) return;
    
    profileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            profileTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show the corresponding content
            const tabContent = document.querySelectorAll('.tab-content');
            tabContent.forEach(content => content.classList.remove('active'));
            
            const contentId = tab.getAttribute('data-tab');
            document.getElementById(contentId).classList.add('active');
        });
    });
    
    // Handle preference tags toggle
    const preferenceTags = document.querySelectorAll('.preference-tag');
    preferenceTags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });
    
    // Handle slider
    const sliderHandle = document.querySelector('.slider-handle');
    const sliderFill = document.querySelector('.slider-fill');
    
    if (sliderHandle && sliderFill) {
        let isDragging = false;
        
        sliderHandle.addEventListener('mousedown', () => {
            isDragging = true;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const sliderBar = document.querySelector('.slider-bar');
            const rect = sliderBar.getBoundingClientRect();
            const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            
            sliderHandle.style.left = `${position * 100}%`;
            sliderFill.style.width = `${position * 100}%`;
        });
    }
} 