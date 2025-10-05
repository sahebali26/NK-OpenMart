// Main JavaScript file for OpenMart e-commerce website

// Global variables
let currentUser = null;
let cart = [];
let wishlist = [];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
});

// Application Initialization
function initializeApp() {
    // Load user data from localStorage
    loadUserData();
    
    // Initialize cart and wishlist
    initializeCart();
    initializeWishlist();
    
    // Update UI based on login status
    updateUIForAuthStatus();
}

function setupEventListeners() {
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            addToCart(productId, productName);
        });
    });
    
    // Wishlist buttons
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            toggleWishlist(productId);
        });
    });
    
    // Search functionality
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchInput = this.querySelector('input[type="search"]');
            if (searchInput && searchInput.value.trim()) {
                searchProducts(searchInput.value.trim());
            }
        });
    }
    
    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                subscribeToNewsletter(emailInput.value);
                emailInput.value = '';
            }
        });
    }
    
    // Product filters
    setupProductFilters();
    
    // Review system
    setupReviewSystem();
    
    // Lazy loading for images
    setupLazyLoading();
}

function loadInitialData() {
    // Load featured products
    loadFeaturedProducts();
    
    // Load categories
    loadCategories();
    
    // Load cart count
    updateCartCount();
    
    // Load wishlist count
    updateWishlistCount();
}

// User Authentication Functions
function loadUserData() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        currentUser = JSON.parse(userData);
    }
}

function updateUIForAuthStatus() {
    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const registerLinks = document.querySelectorAll('a[href="register.html"]');
    const profileLinks = document.querySelectorAll('a[href="profile.html"]');
    const logoutLinks = document.querySelectorAll('.logout-link');
    
    if (currentUser) {
        // User is logged in
        loginLinks.forEach(link => {
            link.innerHTML = `<i class="fas fa-user"></i> ${currentUser.name}`;
            link.href = 'profile.html';
        });
        
        registerLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        // Add logout functionality if not already present
        if (logoutLinks.length === 0) {
            addLogoutButton();
        }
    } else {
        // User is not logged in
        logoutLinks.forEach(link => {
            link.style.display = 'none';
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
        logoutItem.querySelector('.logout-link').addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

async function logout() {
    try {
        const response = await fetch('api/logout.php');
        const result = await response.json();
        
        if (result.success) {
            localStorage.removeItem('currentUser');
            currentUser = null;
            showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    }
}

// Cart Management Functions
function initializeCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartDisplay();
}

function addToCart(productId, productName = '') {
    if (!currentUser) {
        showNotification('Please login to add items to cart', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        // Get product details (in real app, this would be from API)
        const product = {
            id: productId,
            name: productName || `Product ${productId}`,
            price: getProductPrice(productId),
            image: getProductImage(productId),
            quantity: 1
        };
        cart.push(product);
    }
    
    saveCart();
    updateCartDisplay();
    showNotification('Product added to cart!', 'success');
    
    // Update cart via API
    updateCartOnServer();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    showNotification('Product removed from cart', 'info');
    
    // Update cart via API
    updateCartOnServer();
}

function updateCartItemQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
            updateCartDisplay();
            
            // Update cart via API
            updateCartOnServer();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartDisplay() {
    updateCartCount();
    
    // Update cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
    
    // Update checkout page if we're on it
    if (window.location.pathname.includes('checkout.html')) {
        renderCheckoutPage();
    }
}

function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

function renderCartPage() {
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                <h4>Your cart is empty</h4>
                <p class="text-muted">Add some products to get started</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
        <div class="card cart-item">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <img src="${item.image}" alt="${item.name}" class="img-fluid rounded">
                    </div>
                    <div class="col-md-4">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="text-muted mb-0">SKU: PROD${item.id}</p>
                    </div>
                    <div class="col-md-2">
                        <span class="fw-bold price">₹${item.price.toFixed(2)}</span>
                    </div>
                    <div class="col-md-2">
                        <div class="quantity-control">
                            <button class="btn btn-outline-secondary decrease" data-id="${item.id}">-</button>
                            <input type="number" class="form-control text-center" value="${item.quantity}" min="1" data-id="${item.id}">
                            <button class="btn btn-outline-secondary increase" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="col-md-1">
                        <span class="fw-bold">₹${itemTotal.toFixed(2)}</span>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    
    // Update cart summary
    if (cartSummary) {
        const shipping = subtotal > 500 ? 0 : 50;
        const tax = subtotal * 0.18; // 18% tax
        const total = subtotal + shipping + tax;
        
        cartSummary.innerHTML = `
            <div class="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>${shipping === 0 ? 'Free' : '₹' + shipping.toFixed(2)}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
                <span>Tax (18%):</span>
                <span>₹${tax.toFixed(2)}</span>
            </div>
            <hr>
            <div class="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>₹${total.toFixed(2)}</strong>
            </div>
            <a href="checkout.html" class="btn btn-primary w-100">Proceed to Checkout</a>
        `;
        cartSummary.style.display = 'block';
    }
    
    // Add event listeners for cart items
    setupCartEventListeners();
}

function setupCartEventListeners() {
    // Quantity decrease buttons
    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const item = cart.find(item => item.id === productId);
            if (item && item.quantity > 1) {
                updateCartItemQuantity(productId, item.quantity - 1);
            }
        });
    });
    
    // Quantity increase buttons
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const item = cart.find(item => item.id === productId);
            if (item) {
                updateCartItemQuantity(productId, item.quantity + 1);
            }
        });
    });
    
    // Quantity input changes
    document.querySelectorAll('.quantity-control input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.getAttribute('data-id');
            const quantity = parseInt(this.value) || 1;
            updateCartItemQuantity(productId, quantity);
        });
    });
    
    // Remove item buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
}

// Wishlist Management Functions
function initializeWishlist() {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
    }
    updateWishlistDisplay();
}

function toggleWishlist(productId) {
    if (!currentUser) {
        showNotification('Please login to manage wishlist', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const index = wishlist.indexOf(productId);
    
    if (index === -1) {
        // Add to wishlist
        wishlist.push(productId);
        showNotification('Added to wishlist', 'success');
        
        // Update wishlist button
        const wishlistBtn = document.querySelector(`.add-to-wishlist[data-id="${productId}"]`);
        if (wishlistBtn) {
            wishlistBtn.innerHTML = '<i class="fas fa-heart"></i>';
            wishlistBtn.classList.add('active');
        }
    } else {
        // Remove from wishlist
        wishlist.splice(index, 1);
        showNotification('Removed from wishlist', 'info');
        
        // Update wishlist button
        const wishlistBtn = document.querySelector(`.add-to-wishlist[data-id="${productId}"]`);
        if (wishlistBtn) {
            wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
            wishlistBtn.classList.remove('active');
        }
    }
    
    saveWishlist();
    updateWishlistDisplay();
    
    // Update wishlist via API
    updateWishlistOnServer();
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function updateWishlistDisplay() {
    updateWishlistCount();
    
    // Update wishlist page if we're on it
    if (window.location.pathname.includes('wishlist.html')) {
        renderWishlistPage();
    }
}

function updateWishlistCount() {
    const wishlistCountElements = document.querySelectorAll('.wishlist-count');
    wishlistCountElements.forEach(element => {
        element.textContent = wishlist.length;
    });
}

function renderWishlistPage() {
    const wishlistContainer = document.getElementById('wishlist-items');
    
    if (!wishlistContainer) return;
    
    if (wishlist.length === 0) {
        wishlistContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                <h4>Your wishlist is empty</h4>
                <p class="text-muted">Save your favorite products here</p>
                <a href="index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }
    
    // This would normally fetch product details from API
    const sampleProducts = [
        { id: '1', name: 'Premium Lipstick', price: 499, image: 'images/products/product1.jpg' },
        { id: '2', name: 'Designer Handbag', price: 1299, image: 'images/products/product2.jpg' },
        { id: '3', name: 'Silver Ring', price: 699, image: 'images/products/product3.jpg' }
    ];
    
    let html = '<div class="row">';
    
    wishlist.forEach(productId => {
        const product = sampleProducts.find(p => p.id === productId);
        if (product) {
            html += `
            <div class="col-md-4 mb-4">
                <div class="card product-card">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <span class="fw-bold price">₹${product.price}</span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-primary add-to-cart" data-id="${product.id}" data-name="${product.name}">
                                Add to Cart
                            </button>
                            <button class="btn btn-sm btn-outline-danger remove-from-wishlist" data-id="${product.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            `;
        }
    });
    
    html += '</div>';
    wishlistContainer.innerHTML = html;
    
    // Add event listeners for wishlist items
    setupWishlistEventListeners();
}

function setupWishlistEventListeners() {
    // Remove from wishlist buttons
    document.querySelectorAll('.remove-from-wishlist').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            toggleWishlist(productId);
        });
    });
}

// Product Management Functions
function loadFeaturedProducts() {
    // This would normally fetch from API
    const featuredProductsContainer = document.getElementById('featured-products');
    if (!featuredProductsContainer) return;
    
    // Sample featured products data
    const featuredProducts = [
        { id: 1, name: 'Premium Lipstick', price: 499, comparePrice: 599, image: 'images/products/product1.jpg', rating: 4.5, discount: 17 },
        { id: 2, name: 'Designer Handbag', price: 1299, comparePrice: 1599, image: 'images/products/product2.jpg', rating: 4.0, discount: 19 },
        { id: 3, name: 'Silver Ring', price: 699, comparePrice: 899, image: 'images/products/product3.jpg', rating: 4.2, discount: 22 },
        { id: 4, name: 'Kitchen Utensil Set', price: 799, comparePrice: 999, image: 'images/products/product4.jpg', rating: 5.0, discount: 20 }
    ];
    
    let html = '';
    featuredProducts.forEach(product => {
        html += `
        <div class="col-md-3 mb-4">
            <div class="card product-card">
                ${product.discount ? `<div class="discount">${product.discount}% OFF</div>` : ''}
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            ${product.comparePrice ? `
                                <span class="compare-price text-muted text-decoration-line-through">₹${product.comparePrice}</span>
                            ` : ''}
                            <span class="fw-bold price ms-2">₹${product.price}</span>
                        </div>
                        <div class="rating">
                            ${generateStarRating(product.rating)}
                        </div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-sm btn-primary add-to-cart" data-id="${product.id}" data-name="${product.name}">
                            Add to Cart
                        </button>
                        <button class="btn btn-sm btn-outline-danger add-to-wishlist ${wishlist.includes(product.id.toString()) ? 'active' : ''}" data-id="${product.id}">
                            <i class="${wishlist.includes(product.id.toString()) ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    });
    
    featuredProductsContainer.innerHTML = html;
}

function loadCategories() {
    // This would normally fetch from API
    const categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) return;
    
    const categories = [
        { name: 'Cosmetics', image: 'images/categories/cosmetics.jpg', link: 'categories/cosmetics.html' },
        { name: 'Ladies Products', image: 'images/categories/ladies-products.jpg', link: 'categories/ladies-products.html' },
        { name: 'Daily Uses', image: 'images/categories/daily-uses.jpg', link: 'categories/daily-uses.html' }
    ];
    
    let html = '';
    categories.forEach(category => {
        html += `
        <div class="col-md-4 mb-4">
            <div class="card category-card">
                <img src="${category.image}" class="card-img-top" alt="${category.name}">
                <div class="card-body text-center">
                    <h5 class="card-title">${category.name}</h5>
                    <a href="${category.link}" class="btn btn-outline-primary">View Products</a>
                </div>
            </div>
        </div>
        `;
    });
    
    categoriesContainer.innerHTML = html;
}

function setupProductFilters() {
    const priceFilter = document.getElementById('price-filter');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');
    const searchInput = document.getElementById('search-input');
    
    if (priceFilter) {
        priceFilter.addEventListener('change', applyProductFilters);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyProductFilters);
    }
    if (sortSelect) {
        sortSelect.addEventListener('change', applyProductFilters);
    }
    if (searchInput) {
        searchInput.addEventListener('input', debounce(applyProductFilters, 300));
    }
}

function applyProductFilters() {
    // This would normally make an API call with filter parameters
    showNotification('Applying filters...', 'info');
    
    // Simulate API call delay
    setTimeout(() => {
        showNotification('Filters applied successfully', 'success');
    }, 500);
}

function searchProducts(query) {
    if (query.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
}

// Utility Functions
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star text-warning"></i>';
    }
    
    // Half star
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt text-warning"></i>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star text-warning"></i>';
    }
    
    return stars;
}

function getProductPrice(productId) {
    // This would normally fetch from API
    const prices = {
        '1': 499,
        '2': 1299,
        '3': 699,
        '4': 799
    };
    return prices[productId] || 0;
}

function getProductImage(productId) {
    // This would normally fetch from API
    const images = {
        '1': 'images/products/product1.jpg',
        '2': 'images/products/product2.jpg',
        '3': 'images/products/product3.jpg',
        '4': 'images/products/product4.jpg'
    };
    return images[productId] || 'images/products/default.jpg';
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${getNotificationIcon(type)} me-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
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

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img.lazy-load');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }
}

function setupReviewSystem() {
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitReview();
        });
    }
}

function submitReview() {
    if (!currentUser) {
        showNotification('Please login to submit a review', 'warning');
        return;
    }
    
    const form = document.getElementById('review-form');
    const formData = new FormData(form);
    
    const reviewData = {
        productId: formData.get('product-id'),
        rating: formData.get('rating'),
        title: formData.get('title'),
        comment: formData.get('comment')
    };
    
    // This would normally be an API call
    console.log('Submitting review:', reviewData);
    showNotification('Thank you for your review!', 'success');
    form.reset();
}

// API Integration Functions
async function updateCartOnServer() {
    if (!currentUser) return;
    
    try {
        const response = await fetch('api/cart.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'sync',
                cart: cart
            })
        });
        
        const result = await response.json();
        if (!result.success) {
            console.error('Failed to sync cart with server');
        }
    } catch (error) {
        console.error('Error syncing cart:', error);
    }
}

async function updateWishlistOnServer() {
    if (!currentUser) return;
    
    try {
        const response = await fetch('api/wishlist.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'sync',
                wishlist: wishlist
            })
        });
        
        const result = await response.json();
        if (!result.success) {
            console.error('Failed to sync wishlist with server');
        }
    } catch (error) {
        console.error('Error syncing wishlist:', error);
    }
}

async function subscribeToNewsletter(email) {
    try {
        const response = await fetch('api/newsletter.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Thank you for subscribing to our newsletter!', 'success');
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        showNotification('Subscription failed. Please try again.', 'error');
    }
}

// Checkout Functions
function renderCheckoutPage() {
    const orderSummary = document.getElementById('order-summary');
    if (!orderSummary) return;
    
    if (cart.length === 0) {
        orderSummary.innerHTML = `
            <div class="alert alert-warning">
                Your cart is empty. <a href="index.html">Continue shopping</a>
            </div>
        `;
        return;
    }
    
    let subtotal = 0;
    let html = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
        <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <div class="d-flex align-items-center">
                <img src="${item.image}" alt="${item.name}" class="rounded me-3" width="60" height="60">
                <div>
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">Qty: ${item.quantity}</small>
                </div>
            </div>
            <span class="fw-bold">₹${itemTotal.toFixed(2)}</span>
        </div>
        `;
    });
    
    const shipping = subtotal > 500 ? 0 : 50;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;
    
    html += `
    <div class="d-flex justify-content-between mb-2">
        <span>Subtotal:</span>
        <span>₹${subtotal.toFixed(2)}</span>
    </div>
    <div class="d-flex justify-content-between mb-2">
        <span>Shipping:</span>
        <span>${shipping === 0 ? 'Free' : '₹' + shipping.toFixed(2)}</span>
    </div>
    <div class="d-flex justify-content-between mb-2">
        <span>Tax:</span>
        <span>₹${tax.toFixed(2)}</span>
    </div>
    <hr>
    <div class="d-flex justify-content-between mb-3">
        <strong>Total:</strong>
        <strong>₹${total.toFixed(2)}</strong>
    </div>
    `;
    
    orderSummary.innerHTML = html;
}

// Export functions for use in other modules
window.OpenMart = {
    addToCart,
    removeFromCart,
    toggleWishlist,
    showNotification,
    updateCartCount,
    updateWishlistCount
};