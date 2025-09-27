
        // Sample product data
        const products = [
            {
                id: 1,
                name: "Luxury Perfume Set",
                brand: "Essence",
                price: 1299,
                originalPrice: 1999,
                image: "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.5,
                reviews: 124,
                badge: "Bestseller"
            },
            {
                id: 2,
                name: "Premium Face Cream",
                brand: "GlowSkin",
                price: 599,
                originalPrice: 899,
                image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.2,
                reviews: 89,
                badge: "New"
            },
            {
                id: 3,
                name: "Elegant Jewelry Set",
                brand: "StyleCraft",
                price: 1599,
                originalPrice: 2499,
                image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.7,
                reviews: 203,
                badge: "Trending"
            },
            {
                id: 4,
                name: "Aromatherapy Oil Set",
                brand: "Nature's Bliss",
                price: 799,
                originalPrice: 1199,
                image: "https://images.unsplash.com/photo-1603665274855-b8f8d93c2b1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.4,
                reviews: 67,
                badge: "Sale"
            },
            {
                id: 5,
                name: "Designer Handbag",
                brand: "ChicStyle",
                price: 2299,
                originalPrice: 3499,
                image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.6,
                reviews: 156,
                badge: "Popular"
            },
            {
                id: 6,
                name: "Luxury Gift Baselite",
                brand: "ElegantGifts",
                price: 999,
                originalPrice: 1499,
                image: "https://images.unsplash.com/photo-1519669556870-63c2b9d13677?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.3,
                reviews: 98,
                badge: "Limited"
            },
            {
                id: 7,
                name: "Premium Lipstick Set",
                brand: "ColorPop",
                price: 699,
                originalPrice: 999,
                image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.8,
                reviews: 287,
                badge: "Bestseller"
            },
            {
                id: 8,
                name: "Stylish Sunglasses",
                brand: "VisionStyle",
                price: 899,
                originalPrice: 1299,
                image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                rating: 4.1,
                reviews: 74,
                badge: "New"
            }
        ];

        // Cart functionality
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // DOM Elements
        const productsGrid = document.getElementById('productsGrid');
        const cartIcon = document.getElementById('cartIcon');
        const cartSidebar = document.getElementById('cartSidebar');
        const closeCart = document.getElementById('closeCart');
        const cartItems = document.getElementById('cartItems');
        const cartCount = document.querySelector('.cart-count');
        const subtotalEl = document.getElementById('subtotal');
        const totalEl = document.getElementById('total');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const checkoutModal = document.getElementById('checkoutModal');
        const closeModal = document.getElementById('closeModal');
        const cancelOrder = document.getElementById('cancelOrder');
        const placeOrder = document.getElementById('placeOrder');
        const overlay = document.getElementById('overlay');
        const themeToggle = document.getElementById('themeToggle');
        
        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            renderProducts();
            updateCart();
            
            // Check for saved theme preference
            if (localStorage.getItem('theme') === 'dark') {
                document.body.classList.add('dark-mode');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
            
            // Hero banner slideshow
            let currentSlide = 0;
            const slides = document.querySelectorAll('.hero-slide');
            
            setInterval(() => {
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
            }, 5000);
        });
        
        // Render products on the page
        function renderProducts() {
            productsGrid.innerHTML = '';
            
            products.forEach(product => {
                const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
                
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-content">
                        <h3 class="product-title">${product.name}</h3>
                        <p class="product-brand">${product.brand}</p>
                        <div class="product-price">
                            <span class="current-price">₹${product.price}</span>
                            <span class="original-price">₹${product.originalPrice}</span>
                            <span class="discount">${discount}% off</span>
                        </div>
                        <div class="product-rating">
                            <div class="stars">
                                ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                            </div>
                            <span class="rating-count">(${product.reviews})</span>
                        </div>
                        <div class="product-actions">
                            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                            <button class="buy-now" data-id="${product.id}">Buy Now</button>
                        </div>
                    </div>
                `;
                
                productsGrid.appendChild(productCard);
            });
            
            // Add event listeners to buttons
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    addToCart(productId);
                });
            });
            
            document.querySelectorAll('.buy-now').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = parseInt(this.getAttribute('data-id'));
                    addToCart(productId);
                    openCart();
                });
            });
        }
        
        // Add product to cart
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    quantity: 1
                });
            }
            
            updateCart();
            saveCartToStorage();
            
            // Show a quick notification
            showNotification(`${product.name} added to cart!`);
        }
        
        // Remove product from cart
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCart();
            saveCartToStorage();
        }
        
        // Update cart quantity
        function updateQuantity(productId, newQuantity) {
            if (newQuantity < 1) {
                removeFromCart(productId);
                return;
            }
            
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity = newQuantity;
                updateCart();
                saveCartToStorage();
            }
        }
        
        // Update cart UI
        function updateCart() {
            cartItems.innerHTML = '';
            let subtotal = 0;
            
            if (cart.length === 0) {
                cartItems.innerHTML = '<p>Your cart is empty</p>';
            } else {
                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    subtotal += itemTotal;
                    
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${item.name}</h4>
                            <p class="cart-item-price">₹${item.price}</p>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                                <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `;
                    
                    cartItems.appendChild(cartItem);
                });
                
                // Add event listeners to quantity buttons
                document.querySelectorAll('.quantity-btn.minus').forEach(button => {
                    button.addEventListener('click', function() {
                        const productId = parseInt(this.getAttribute('data-id'));
                        const item = cart.find(item => item.id === productId);
                        updateQuantity(productId, item.quantity - 1);
                    });
                });
                
                document.querySelectorAll('.quantity-btn.plus').forEach(button => {
                    button.addEventListener('click', function() {
                        const productId = parseInt(this.getAttribute('data-id'));
                        const item = cart.find(item => item.id === productId);
                        updateQuantity(productId, item.quantity + 1);
                    });
                });
                
                document.querySelectorAll('.quantity-input').forEach(input => {
                    input.addEventListener('change', function() {
                        const productId = parseInt(this.getAttribute('data-id'));
                        updateQuantity(productId, parseInt(this.value));
                    });
                });
                
                document.querySelectorAll('.remove-item').forEach(button => {
                    button.addEventListener('click', function() {
                        const productId = parseInt(this.getAttribute('data-id'));
                        removeFromCart(productId);
                    });
                });
            }
            
            const total = subtotal + 40; // Adding shipping cost
            
            subtotalEl.textContent = `₹${subtotal}`;
            totalEl.textContent = `₹${total}`;
            cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
        
        // Save cart to localStorage
        function saveCartToStorage() {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        
        // Open cart sidebar
        function openCart() {
            cartSidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Close cart sidebar
        function closeCartSidebar() {
            cartSidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // Open checkout modal
        function openCheckoutModal() {
            if (cart.length === 0) {
                showNotification('Your cart is empty!');
                return;
            }
            
            // Update order summary in modal
            const modalOrderSummary = document.getElementById('modalOrderSummary');
            modalOrderSummary.innerHTML = '';
            
            cart.forEach(item => {
                const itemSummary = document.createElement('div');
                itemSummary.className = 'total-row';
                itemSummary.innerHTML = `
                    <span>${item.name} x ${item.quantity}</span>
                    <span>₹${item.price * item.quantity}</span>
                `;
                modalOrderSummary.appendChild(itemSummary);
            });
            
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const total = subtotal + 40;
            
            const subtotalRow = document.createElement('div');
            subtotalRow.className = 'total-row';
            subtotalRow.innerHTML = `<span>Subtotal:</span><span>₹${subtotal}</span>`;
            modalOrderSummary.appendChild(subtotalRow);
            
            const shippingRow = document.createElement('div');
            shippingRow.className = 'total-row';
            shippingRow.innerHTML = `<span>Shipping:</span><span>₹40</span>`;
            modalOrderSummary.appendChild(shippingRow);
            
            const totalRow = document.createElement('div');
            totalRow.className = 'total-row total-final';
            totalRow.innerHTML = `<span>Total:</span><span>₹${total}</span>`;
            modalOrderSummary.appendChild(totalRow);
            
            checkoutModal.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Close checkout modal
        function closeCheckoutModal() {
            checkoutModal.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // Place order (generate WhatsApp message)
        function placeOrderFunction() {
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            const pincode = document.getElementById('pincode').value;
            
            if (!name || !phone || !address || !pincode) {
                showNotification('Please fill in all fields!');
                return;
            }
            
            // Generate order summary
            let orderSummary = `Order Details:%0A`;
            cart.forEach(item => {
                orderSummary += `- ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}%0A`;
            });
            
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const total = subtotal + 40;
            
            orderSummary += `%0ASubtotal: ₹${subtotal}%0AShipping: ₹40%0ATotal: ₹${total}`;
            
            // Generate customer info
            const customerInfo = `Customer Information:%0AName: ${name}%0APhone: ${phone}%0AAddress: ${address}%0APincode: ${pincode}`;
            
            // Generate WhatsApp message
            const message = `Hello NK OpenMart! I would like to place an order.%0A%0A${orderSummary}%0A%0A${customerInfo}`;
            
            // Open WhatsApp with the message
            window.open(`https://wa.me/916003816583?text=${message}`, '_blank');
            
            // Clear cart and close modals
            cart = [];
            updateCart();
            saveCartToStorage();
            closeCheckoutModal();
            closeCartSidebar();
            
            // Reset form
            document.getElementById('checkoutForm').reset();
            
            showNotification('Order placed successfully! Check WhatsApp for confirmation.');
        }
        
        // Show notification
        function showNotification(message) {
            // Create notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--accent-light);
                color: white;
                padding: 15px 20px;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 2000;
                transition: all 0.3s ease;
                transform: translateX(150%);
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Animate out and remove
            setTimeout(() => {
                notification.style.transform = 'translateX(150%)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
        }
        
        // Toggle dark/light mode
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }
        
        // Event listeners
        cartIcon.addEventListener('click', openCart);
        closeCart.addEventListener('click', closeCartSidebar);
        checkoutBtn.addEventListener('click', openCheckoutModal);
        closeModal.addEventListener('click', closeCheckoutModal);
        cancelOrder.addEventListener('click', closeCheckoutModal);
        placeOrder.addEventListener('click', placeOrderFunction);
        overlay.addEventListener('click', function() {
            closeCartSidebar();
            closeCheckoutModal();
        });
        themeToggle.addEventListener('click', toggleTheme);
