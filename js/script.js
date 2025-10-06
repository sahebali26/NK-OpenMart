// Main JavaScript file for OpenMart e-commerce website

// Global variables
let currentUser = null;
let cart = [];
let wishlist = [];
let products = [];

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
    // Add to cart buttons - improved selector to work on all pages
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart')) {
            const button = e.target.closest('.add-to-cart');
            const productId = button.getAttribute('data-id');
            const productName = button.getAttribute('data-name');
            addToCart(productId, productName);
        }
        
        // Wishlist buttons - improved selector to work on all pages
        if (e.target.closest('.add-to-wishlist')) {
            const button = e.target.closest('.add-to-wishlist');
            const productId = button.getAttribute('data-id');
            toggleWishlist(productId);
        }
        
        // Buy Now buttons
        if (e.target.closest('.buy-now')) {
            const button = e.target.closest('.buy-now');
            const productId = button.getAttribute('data-id');
            const productName = button.getAttribute('data-name');
            buyNow(productId, productName);
        }
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
            if (emailInput && emailInput.value.trim()) {
                subscribeToNewsletter(emailInput.value.trim());
            }
        });
    }
    
    // Product filters
    setupProductFilters();
    
    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processCheckout();
        });
    }
    
    // Mobile filter toggle
    const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
    if (mobileFilterToggle) {
        mobileFilterToggle.addEventListener('click', function() {
            const filterSidebar = document.getElementById('filter-sidebar');
            if (filterSidebar) {
                filterSidebar.classList.toggle('show');
            }
        });
    }
    
    // Mobile filter close
    const mobileFilterClose = document.getElementById('mobile-filter-close');
    if (mobileFilterClose) {
        mobileFilterClose.addEventListener('click', function() {
            const filterSidebar = document.getElementById('filter-sidebar');
            if (filterSidebar) {
                filterSidebar.classList.remove('show');
            }
        });
    }
}

function loadInitialData() {
    // Load products data
    loadProducts();
    
    // Load cart count
    updateCartCount();
    
    // Load wishlist count
    updateWishlistCount();
    
    // Load order summary if on checkout page
    if (window.location.pathname.includes('checkout.html')) {
        renderOrderSummary();
    }
    
    // Update product display based on current page
    updateProductDisplayForCurrentPage();
}

// Product Management Functions
function loadProducts() {
    // Sample products data - in a real app, this would come from an API
    products = [
        { id: '1', name: 'Premium Lipstick', price: 499, comparePrice: 599, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpc3AXiXeCbq9t0NI2kpm5Wusc5-stOUwZFQ&s', category: 'Cosmetics', rating: 4.5, discount: 17 },
        { id: '2', name: 'Designer Handbag', price: 1299, comparePrice: 1599, image: 'https://img.lazcdn.com/g/p/ac352cbdfb1cc2c828207c61040f8fc1.jpg_720x720q80.jpg', category: 'Fashion', rating: 4.0, discount: 19 },
        { id: '3', name: 'Silver Ring', price: 699, comparePrice: 899, image: 'https://salty.co.in/cdn/shop/files/RS13537-S_d625fa69-0d20-49c1-9dfb-4ad9740aa3e2.jpg?v=1753113851&width=1080', category: 'Fashion', rating: 4.2, discount: 22 },
        { id: '4', name: 'Kitchen Utensil Set', price: 799, comparePrice: 999, image: 'https://images-cdn.ubuy.co.in/689fdf9913552c042402a866-18-10-stainless-steel-kitchen-utensils.jpg', category: 'Daily Uses', rating: 5.0, discount: 20 },
        { id: '5', name: 'Wireless Headphones', price: 1599, image: 'https://www.beatsbydre.com/content/dam/beats/web/product/headphones/solo4-wireless/pdp/product-carousel/cloud-pink/pink-01-solo4.jpg', category: 'Electronics', rating: 4.6, discount: 0 },
        { id: '6', name: 'Smart Watch', price: 3499, image: 'images/products/product6.jpg', category: 'Electronics', rating: 4.3, discount: 0 },
        { id: '7', name: 'Organic Face Cream', price: 349, comparePrice: 449, image: 'images/products/face-cream.jpg', category: 'Cosmetics', rating: 5.0, discount: 22 },
        { id: '8', name: 'Complete Makeup Kit', price: 1499, comparePrice: 1999, image: 'images/products/makeup-kit.jpg', category: 'Cosmetics', rating: 4.0, discount: 25 },
        { id: '9', name: 'Waterproof Eyeliner', price: 299, image: 'images/products/eyeliner.jpg', category: 'Cosmetics', rating: 3.5, discount: 0 },
        { id: '10', name: 'Matte Foundation', price: 649, comparePrice: 799, image: 'images/products/foundation.jpg', category: 'Cosmetics', rating: 5.0, discount: 19 },
        { id: '11', name: 'Gel Nail Polish Set', price: 899, image: 'images/products/nail-polish.jpg', category: 'Cosmetics', rating: 4.0, discount: 0 },
        { id: '12', name: 'Volumizing Mascara', price: 349, comparePrice: 499, image: 'images/products/mascara.jpg', category: 'Cosmetics', rating: 3.5, discount: 30 },
        { id: '13', name: 'Skincare Routine Set', price: 1299, image: 'images/products/skincare-set.jpg', category: 'Cosmetics', rating: 5.0, discount: 0 },
        { id: '14', name: 'Elegant Ladies Watch', price: 2499, image: 'images/products/ladies-watch.jpg', category: 'Ladies Products', rating: 5.0, discount: 0 },
        { id: '15', name: 'Designer Scarf Set', price: 799, image: 'images/products/scarf-set.jpg', category: 'Ladies Products', rating: 4.0, discount: 0 },
        { id: '16', name: 'Pearl Jewelry Set', price: 999, comparePrice: 1299, image: 'images/products/jewelry-set.jpg', category: 'Ladies Products', rating: 4.5, discount: 23 },
        { id: '17', name: 'Evening Clutch', price: 1099, image: 'images/products/clutch.jpg', category: 'Ladies Products', rating: 4.0, discount: 0 },
        { id: '18', name: 'Hair Accessories Set', price: 499, comparePrice: 599, image: 'images/products/hair-accessories.jpg', category: 'Ladies Products', rating: 3.5, discount: 17 },
        { id: '19', name: 'Designer Sunglasses', price: 1299, image: 'images/products/sunglasses.jpg', category: 'Ladies Products', rating: 5.0, discount: 0 }
    ];
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

function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
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
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName || product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartDisplay();
    showNotification(`${productName || product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    showNotification('Product removed from cart', 'info');
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
        renderOrderSummary();
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
    
    // Update wishlist buttons on all pages
    document.querySelectorAll('.add-to-wishlist').forEach(button => {
        const productId = button.getAttribute('data-id');
        if (wishlist.includes(productId)) {
            button.innerHTML = '<i class="fas fa-heart"></i>';
            button.classList.add('active');
        } else {
            button.innerHTML = '<i class="far fa-heart"></i>';
            button.classList.remove('active');
        }
    });
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
    
    let html = '<div class="row">';
    
    wishlist.forEach(productId => {
        const product = products.find(p => p.id === productId);
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
                                ${product.comparePrice ? `<span class="compare-price text-muted text-decoration-line-through">₹${product.comparePrice}</span>` : ''}
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

// Product Filter Functions
function setupProductFilters() {
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    const applyPrice = document.getElementById('apply-price');
    const categoryFilters = document.querySelectorAll('input[type="checkbox"][id^="cat-"]');
    const ratingFilters = document.querySelectorAll('input[type="checkbox"][id^="rating-"]');
    const resetFilters = document.getElementById('reset-filters');
    
    if (applyPrice) {
        applyPrice.addEventListener('click', applyProductFilters);
    }
    
    if (categoryFilters.length > 0) {
        categoryFilters.forEach(filter => {
            filter.addEventListener('change', applyProductFilters);
        });
    }
    
    if (ratingFilters.length > 0) {
        ratingFilters.forEach(filter => {
            filter.addEventListener('change', applyProductFilters);
        });
    }
    
    if (resetFilters) {
        resetFilters.addEventListener('click', resetProductFilters);
    }
}

function applyProductFilters() {
    // Get filter values
    const priceMin = document.getElementById('price-min')?.value || 0;
    const priceMax = document.getElementById('price-max')?.value || Infinity;
    const selectedCategories = Array.from(document.querySelectorAll('input[type="checkbox"][id^="cat-"]:checked'))
        .map(cb => cb.id.replace('cat-', ''));
    const selectedRatings = Array.from(document.querySelectorAll('input[type="checkbox"][id^="rating-"]:checked'))
        .map(cb => parseInt(cb.id.replace('rating-', '')));
    
    // Filter products
    let filteredProducts = products.filter(product => {
        // Price filter
        if (product.price < priceMin || product.price > priceMax) return false;
        
        // Category filter
        if (selectedCategories.length > 0 && !selectedCategories.includes('all')) {
            if (!selectedCategories.includes(product.category.toLowerCase().replace(' ', '-'))) return false;
        }
        
        // Rating filter
        if (selectedRatings.length > 0) {
            const minRating = Math.min(...selectedRatings);
            if (product.rating < minRating) return false;
        }
        
        return true;
    });
    
    // Update product display
    updateProductDisplay(filteredProducts);
    showNotification(`Found ${filteredProducts.length} products`, 'success');
    
    // Close mobile filter sidebar after applying filters
    const filterSidebar = document.getElementById('filter-sidebar');
    if (filterSidebar && window.innerWidth < 992) {
        filterSidebar.classList.remove('show');
    }
}

function resetProductFilters() {
    // Reset all filter inputs
    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';
    
    document.querySelectorAll('input[type="checkbox"][id^="cat-"]').forEach(cb => {
        cb.checked = cb.id === 'cat-all';
    });
    
    document.querySelectorAll('input[type="checkbox"][id^="rating-"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Show all products
    updateProductDisplay(products);
    showNotification('Filters reset', 'info');
    
    // Close mobile filter sidebar after resetting filters
    const filterSidebar = document.getElementById('filter-sidebar');
    if (filterSidebar && window.innerWidth < 992) {
        filterSidebar.classList.remove('show');
    }
}

// Add this function to handle page-specific product filtering
function updateProductDisplayForCurrentPage() {
    let filteredProducts = products;
    
    // Check which page we're on and filter accordingly
    if (window.location.pathname.includes('cosmetics.html')) {
        filteredProducts = products.filter(product => product.category === 'Cosmetics');
    } else if (window.location.pathname.includes('ladies-products.html')) {
        filteredProducts = products.filter(product => product.category === 'Ladies Products');
    } else if (window.location.pathname.includes('daily-uses.html')) {
        filteredProducts = products.filter(product => product.category === 'Daily Uses');
    } else if (window.location.pathname.includes('electronics.html')) {
        filteredProducts = products.filter(product => product.category === 'Electronics');
    } else if (window.location.pathname.includes('fashion.html')) {
        filteredProducts = products.filter(product => product.category === 'Fashion');
    } else if (window.location.pathname.includes('products.html')) {
        // All products page shows everything
        filteredProducts = products;
    }
    
    updateProductDisplay(filteredProducts);
}

function updateProductDisplay(filteredProducts) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4>No products found</h4>
                <p class="text-muted">Try adjusting your filters or browse other categories</p>
                <a href="../index.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        
        // Update product count
        const productCount = document.getElementById('product-count');
        if (productCount) {
            productCount.textContent = '0 products';
        }
        
        // Update category badge count
        updateCategoryBadgeCount(0);
        return;
    }
    
    let html = '';
    
    filteredProducts.forEach(product => {
        html += `
        <div class="col-xl-4 col-md-6 mb-4">
            <div class="card product-card">
                ${product.discount ? `<div class="badge bg-danger position-absolute top-0 end-0 m-2">${product.discount}% OFF</div>` : ''}
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div>
                            ${product.comparePrice ? `<span class="text-muted text-decoration-line-through">₹${product.comparePrice}</span>` : ''}
                            <span class="fw-bold ms-2 price">₹${product.price}</span>
                        </div>
                        <div class="rating">
                            ${generateStarRating(product.rating)}
                        </div>
                    </div>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-sm btn-primary add-to-cart" data-id="${product.id}" data-name="${product.name}">
                            Add to Cart
                        </button>
                        <button class="btn btn-sm btn-outline-danger add-to-wishlist ${wishlist.includes(product.id) ? 'active' : ''}" data-id="${product.id}">
                            <i class="${wishlist.includes(product.id) ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                        <button class="btn btn-sm btn-success buy-now" data-id="${product.id}" data-name="${product.name}">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    });
    
    productsGrid.innerHTML = html;
    
    // Update product count
    const productCount = document.getElementById('product-count');
    if (productCount) {
        productCount.textContent = `${filteredProducts.length} products`;
    }
    
    // Update category badge count
    updateCategoryBadgeCount(filteredProducts.length);
}

// Add this function to update category badge counts
function updateCategoryBadgeCount(count) {
    // Update the category page badge
    const categoryBadge = document.querySelector('.badge.bg-primary');
    if (categoryBadge) {
        categoryBadge.textContent = `${count} Products`;
    }
}

// Search Function
function searchProducts(query) {
    if (query.trim()) {
        // Filter products based on search query
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
        
        // Update product display
        updateProductDisplay(filteredProducts);
        showNotification(`Found ${filteredProducts.length} products for "${query}"`, 'success');
    }
}

// Buy Now Function
function buyNow(productId, productName) {
    // Clear cart and add only this product
    cart = [{
        id: productId,
        name: productName,
        price: getProductPrice(productId),
        image: getProductImage(productId),
        quantity: 1
    }];
    
    saveCart();
    updateCartDisplay();
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// Checkout Functions
function renderOrderSummary() {
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
    
    const shippingMethod = document.getElementById('shippingMethod');
    const shippingCost = shippingMethod ? getShippingCost(shippingMethod.value) : 50;
    const tax = subtotal * 0.18;
    const total = subtotal + shippingCost + tax;
    
    html += `
    <div class="d-flex justify-content-between mb-2">
        <span>Subtotal:</span>
        <span>₹${subtotal.toFixed(2)}</span>
    </div>
    <div class="d-flex justify-content-between mb-2">
        <span>Shipping:</span>
        <span>₹${shippingCost.toFixed(2)}</span>
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
    `;
    
    orderSummary.innerHTML = html;
    
    // Update shipping cost when method changes
    if (shippingMethod) {
        shippingMethod.addEventListener('change', function() {
            renderOrderSummary();
        });
    }
}

function getShippingCost(method) {
    const costs = {
        'standard': 50,
        'express': 150,
        'overnight': 300
    };
    return costs[method] || 50;
}

function processCheckout() {
    // Validate form
    if (!validateCheckoutForm()) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Collect order data
    const orderData = collectOrderData();
    
    // Submit order to WhatsApp
    submitOrderToWhatsApp(orderData);
}

function validateCheckoutForm() {
    const requiredFields = document.querySelectorAll('#checkoutForm [required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

function collectOrderData() {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    
    // Calculate order totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingMethod = document.getElementById('shippingMethod').value;
    const shippingCost = getShippingCost(shippingMethod);
    const tax = subtotal * 0.18;
    const total = subtotal + shippingCost + tax;
    
    return {
        customer: {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: formData.get('city'),
            state: formData.get('state'),
            zip: formData.get('zip')
        },
        order: {
            items: cart,
            subtotal: subtotal,
            shipping: shippingCost,
            tax: tax,
            total: total,
            shippingMethod: shippingMethod,
            orderDate: new Date().toLocaleDateString()
        }
    };
}

function submitOrderToWhatsApp(orderData) {
    // Format the message for WhatsApp
    const message = formatWhatsAppMessage(orderData);
    
    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // WhatsApp API URL
    const phoneNumber = '+916003816583';
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappURL, '_blank');
    
    // Show success message
    showNotification('Order submitted successfully! Opening WhatsApp...', 'success');
    
    // Clear cart after successful order
    setTimeout(() => {
        cart = [];
        saveCart();
        updateCartDisplay();
    }, 2000);
}

function formatWhatsAppMessage(orderData) {
    const { customer, order } = orderData;
    
    let message = `*NEW ORDER - OpenMart*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${customer.name}\n`;
    message += `Email: ${customer.email}\n`;
    message += `Phone: ${customer.phone}\n`;
    message += `Address: ${customer.address}, ${customer.city}, ${customer.state} - ${customer.zip}\n\n`;
    
    message += `*Order Details:*\n`;
    order.items.forEach(item => {
        message += `- ${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n*Order Summary:*\n`;
    message += `Subtotal: ₹${order.subtotal.toFixed(2)}\n`;
    message += `Shipping (${order.shippingMethod}): ₹${order.shipping.toFixed(2)}\n`;
    message += `Tax: ₹${order.tax.toFixed(2)}\n`;
    message += `*Total: ₹${order.total.toFixed(2)}*\n\n`;
    message += `Order Date: ${order.orderDate}\n\n`;
    message += `Thank you for your order!`;
    
    return message;
}

// Utility Functions
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
            <i class="fas ${getNotificationIcon(type)} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Position notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

function getProductPrice(productId) {
    const product = products.find(p => p.id === productId);
    return product ? product.price : 0;
}

function getProductImage(productId) {
    const product = products.find(p => p.id === productId);
    return product ? product.image : '';
}

// Newsletter Subscription
function subscribeToNewsletter(email) {
    // In a real application, this would send the email to a server
    const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
    
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
        showNotification('Thank you for subscribing to our newsletter!', 'success');
    } else {
        showNotification('You are already subscribed to our newsletter.', 'info');
    }
    
    // Clear the input
    const emailInput = document.querySelector('.newsletter-form input[type="email"]');
    if (emailInput) {
        emailInput.value = '';
    }
}

// Handle page-specific initialization
function initializePage() {
    const path = window.location.pathname;
    
    if (path.includes('categories/') || path.includes('products.html')) {
        // Initialize category page with filtered products
        updateProductDisplayForCurrentPage();
    } else if (path.includes('cart.html')) {
        // Initialize cart page
        renderCartPage();
    } else if (path.includes('wishlist.html')) {
        // Initialize wishlist page
        renderWishlistPage();
    } else if (path.includes('checkout.html')) {
        // Initialize checkout page
        renderOrderSummary();
    }
}

// Call page initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);