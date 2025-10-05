// Authentication JavaScript for OpenMart

document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Profile form handler
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
        loadUserProfile();
    }

    // Check if user is logged in
    checkAuthStatus();
}

async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const loginData = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    // Validate inputs
    if (!loginData.email || !loginData.password) {
        showAuthNotification('Please fill in all fields', 'error');
        return;
    }

    if (!validateEmail(loginData.email)) {
        showAuthNotification('Please enter a valid email address', 'error');
        return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Logging in...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();

        if (result.success) {
            // Store user data in localStorage
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            
            showAuthNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to home page or intended destination
            setTimeout(() => {
                const redirectTo = getUrlParameter('redirect') || 'index.html';
                window.location.href = redirectTo;
            }, 1000);
        } else {
            showAuthNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAuthNotification('Login failed. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const registerData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirm_password: formData.get('confirm_password'),
        phone: formData.get('phone'),
        address: formData.get('address')
    };

    // Validate inputs
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirm_password) {
        showAuthNotification('Please fill in all required fields', 'error');
        return;
    }

    if (!validateEmail(registerData.email)) {
        showAuthNotification('Please enter a valid email address', 'error');
        return;
    }

    if (registerData.password.length < 6) {
        showAuthNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    if (registerData.password !== registerData.confirm_password) {
        showAuthNotification('Passwords do not match', 'error');
        return;
    }

    if (registerData.phone && !validatePhone(registerData.phone)) {
        showAuthNotification('Please enter a valid phone number', 'error');
        return;
    }

    // Remove confirm_password before sending to server
    delete registerData.confirm_password;

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Creating account...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });

        const result = await response.json();

        if (result.success) {
            showAuthNotification('Registration successful! Redirecting to login...', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            showAuthNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAuthNotification('Registration failed. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    if (!isLoggedIn()) {
        showAuthNotification('Please login to update your profile', 'error');
        return;
    }

    const form = e.target;
    const formData = new FormData(form);
    
    const profileData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zip_code: formData.get('zip_code')
    };

    // Validate inputs
    if (!profileData.name) {
        showAuthNotification('Name is required', 'error');
        return;
    }

    if (profileData.phone && !validatePhone(profileData.phone)) {
        showAuthNotification('Please enter a valid phone number', 'error');
        return;
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Updating profile...';
    submitBtn.disabled = true;

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const response = await fetch('api/profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...profileData,
                user_id: currentUser.id
            })
        });

        const result = await response.json();

        if (result.success) {
            // Update local storage
            const updatedUser = { ...currentUser, ...profileData };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            showAuthNotification('Profile updated successfully!', 'success');
        } else {
            showAuthNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        showAuthNotification('Profile update failed. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function loadUserProfile() {
    if (!isLoggedIn()) {
        return;
    }

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const response = await fetch(`api/profile.php?user_id=${currentUser.id}`);
        const result = await response.json();

        if (result.success) {
            const user = result.user;
            
            // Populate form fields
            document.getElementById('profile-name').value = user.name || '';
            document.getElementById('profile-email').value = user.email || '';
            document.getElementById('profile-phone').value = user.phone || '';
            document.getElementById('profile-address').value = user.address || '';
            document.getElementById('profile-city').value = user.city || '';
            document.getElementById('profile-state').value = user.state || '';
            document.getElementById('profile-zip').value = user.zip_code || '';
            
            // Update display elements
            const displayName = document.getElementById('user-display-name');
            if (displayName) {
                displayName.textContent = user.name;
            }
            
            const displayEmail = document.getElementById('user-display-email');
            if (displayEmail) {
                displayEmail.textContent = user.email;
            }
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // User is logged in
        updateUIAuthStatus(true, currentUser);
        
        // If on login/register page, redirect to home
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('register.html')) {
            window.location.href = 'index.html';
        }
    } else {
        // User is not logged in
        updateUIAuthStatus(false);
        
        // If on protected pages, redirect to login
        const protectedPages = ['profile.html', 'checkout.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
        }
    }
}

function updateUIAuthStatus(isLoggedIn, user = null) {
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const registerLinks = document.querySelectorAll('a[href="register.html"]');
    const profileLinks = document.querySelectorAll('a[href="profile.html"]');
    const logoutLinks = document.querySelectorAll('.logout-link');

    if (isLoggedIn && user) {
        // Update login links to show user profile
        loginLinks.forEach(link => {
            link.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
            link.href = 'profile.html';
        });

        // Hide register links
        registerLinks.forEach(link => {
            link.style.display = 'none';
        });

        // Show profile links
        profileLinks.forEach(link => {
            link.style.display = 'block';
        });

        // Add logout button if not present
        addLogoutButton();
    } else {
        // Show login and register links
        loginLinks.forEach(link => {
            link.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            link.href = 'login.html';
        });

        registerLinks.forEach(link => {
            link.style.display = 'block';
        });

        // Hide profile links
        profileLinks.forEach(link => {
            link.style.display = 'none';
        });

        // Remove logout buttons
        logoutLinks.forEach(link => {
            link.remove();
        });
    }
}

function addLogoutButton() {
    const navbarNav = document.querySelector('.navbar-nav');
    if (navbarNav && !document.querySelector('.logout-link')) {
        const logoutItem = document.createElement('li');
        logoutItem.className = 'nav-item';
        logoutItem.innerHTML = `
            <a class="nav-link logout-link" href="#" style="cursor: pointer;">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        `;
        navbarNav.appendChild(logoutItem);

        // Add logout event listener
        logoutItem.querySelector('.logout-link').addEventListener('click', handleLogout);
    }
}

async function handleLogout(e) {
    if (e) e.preventDefault();
    
    try {
        const response = await fetch('api/logout.php');
        const result = await response.json();

        if (result.success) {
            // Clear local storage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('cart');
            localStorage.removeItem('wishlist');
            
            showAuthNotification('Logged out successfully', 'success');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Logout error:', error);
        showAuthNotification('Logout failed', 'error');
    }
}

function isLoggedIn() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser !== null;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

function showAuthNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.auth-notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} auth-notification`;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
            <span>${message}</span>
        </div>
    `;

    // Add to the form or page
    const form = document.querySelector('form');
    if (form) {
        form.parentNode.insertBefore(notification, form);
    } else {
        document.querySelector('.auth-container').prepend(notification);
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getUrlParameter(name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Password strength indicator
function setupPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('password-strength');

    if (passwordInput && strengthIndicator) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            strengthIndicator.innerHTML = '';
            strengthIndicator.className = 'password-strength';
            
            if (password.length > 0) {
                const strengthText = document.createElement('small');
                strengthText.textContent = strength.text;
                strengthText.className = `text-${strength.color}`;
                strengthIndicator.appendChild(strengthText);
            }
        });
    }
}

function calculatePasswordStrength(password) {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    if (score <= 2) {
        return { text: 'Weak', color: 'danger' };
    } else if (score <= 4) {
        return { text: 'Medium', color: 'warning' };
    } else {
        return { text: 'Strong', color: 'success' };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupPasswordStrength();
});