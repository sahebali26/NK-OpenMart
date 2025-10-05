-- OpenMart E-commerce Database Setup
-- Created: 2024-01-15
-- Author: OpenMart Team

-- Create database
CREATE DATABASE IF NOT EXISTS openmart;
USE openmart;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    role ENUM('customer', 'admin') DEFAULT 'customer',
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(255),
    parent_id INT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    category_id INT,
    image VARCHAR(255),
    gallery TEXT, -- JSON array of image paths
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    meta_title VARCHAR(255),
    meta_description TEXT,
    tags TEXT,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_featured (is_featured),
    INDEX idx_active (is_active),
    INDEX idx_price (price),
    INDEX idx_slug (slug),
    FULLTEXT idx_search (name, description, tags)
);

-- Product attributes table
CREATE TABLE IF NOT EXISTS product_attributes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    attributes TEXT, -- JSON for product variations
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id),
    INDEX idx_user (user_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist_item (user_id, product_id),
    INDEX idx_user (user_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_method ENUM('cod', 'card', 'upi', 'netbanking') DEFAULT 'cod',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    shipping_address TEXT,
    billing_address TEXT,
    customer_notes TEXT,
    admin_notes TEXT,
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_order_number (order_number),
    INDEX idx_created_at (created_at)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    attributes TEXT, -- JSON for product variations at time of order
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_product_review (product_id, user_id),
    INDEX idx_product (product_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating)
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_amount DECIMAL(10,2) DEFAULT 0,
    maximum_discount DECIMAL(10,2),
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active)
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_read (is_read)
);

-- Product views tracking
CREATE TABLE IF NOT EXISTS product_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_viewed_at (viewed_at)
);

-- Inventory log table
CREATE TABLE IF NOT EXISTS inventory_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    old_stock INT NOT NULL,
    new_stock INT NOT NULL,
    change_type ENUM('sale', 'restock', 'adjustment', 'return') NOT NULL,
    reference_id INT, -- order_id or other reference
    notes TEXT,
    created_by INT, -- user_id who made the change
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_created_at (created_at)
);

-- Insert sample data

-- Insert admin user
INSERT INTO users (name, email, password, role, is_active) VALUES 
('Admin User', 'admin@openmart.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE);

-- Insert sample categories
INSERT INTO categories (name, slug, description, image) VALUES 
('Cosmetics', 'cosmetics', 'Beauty and cosmetic products for daily care and special occasions', 'images/categories/cosmetics.jpg'),
('Ladies Products', 'ladies-products', 'Exclusive products designed for women including fashion and accessories', 'images/categories/ladies-products.jpg'),
('Daily Uses', 'daily-uses', 'Essential everyday products for household and personal care', 'images/categories/daily-uses.jpg'),
('Electronics', 'electronics', 'Latest gadgets and electronic devices', 'images/categories/electronics.jpg'),
('Fashion', 'fashion', 'Trendy clothing and fashion accessories', 'images/categories/fashion.jpg');

-- Insert sample products
INSERT INTO products (name, slug, description, short_description, price, compare_price, category_id, stock_quantity, is_featured, sku) VALUES 
('Premium Matte Lipstick', 'premium-matte-lipstick', 'Long-lasting matte lipstick with rich color payoff. Waterproof and transfer-proof formula that stays perfect all day. Enriched with vitamin E and jojoba oil for smooth application.', 'Rich color matte lipstick with all-day wear', 499.00, 599.00, 1, 50, 1, 'LIP001'),
('Designer Leather Handbag', 'designer-leather-handbag', 'Genuine leather handbag with multiple compartments. Perfect for daily use or special occasions. Features adjustable strap and secure zip closure.', 'Genuine leather handbag with multiple compartments', 1299.00, 1599.00, 2, 25, 1, 'BAG001'),
('Silver Plated Ring', 'silver-plated-ring', 'Elegant silver plated ring with crystal stones. Adjustable size for perfect fit. Perfect for daily wear or special occasions.', 'Elegant silver ring with crystal stones', 699.00, 899.00, 2, 100, 0, 'RING001'),
('5-Piece Kitchen Utensil Set', 'kitchen-utensil-set', 'Stainless steel kitchen utensil set including spatula, ladle, spoon, and more. Ergonomic handles for comfortable grip. Dishwasher safe.', 'Complete kitchen tool set with ergonomic handles', 799.00, 999.00, 3, 30, 1, 'KIT001'),
('Organic Face Cream', 'organic-face-cream', '100% organic face cream with aloe vera and vitamin E. Suitable for all skin types. Provides 24-hour moisture without greasy feel.', 'Natural face moisturizer for all skin types', 349.00, 449.00, 1, 75, 0, 'CRM001'),
('Wireless Earbuds', 'wireless-earbuds', 'Bluetooth 5.0 wireless earbuds with charging case. 20 hours battery life with noise cancellation. IPX5 water resistance.', 'High-quality audio earbuds with noise cancellation', 1599.00, 1999.00, 4, 40, 1, 'EAR001'),
('Cotton T-Shirt Pack', 'cotton-tshirt-pack', 'Pack of 3 premium cotton t-shirts. Available in multiple colors. Machine washable with color-fast technology.', 'Comfortable cotton t-shirts in multiple colors', 899.00, 1099.00, 5, 60, 0, 'TSH001'),
('Smart Fitness Watch', 'smart-fitness-watch', 'Advanced fitness tracking with heart rate monitor, sleep tracking, and multiple sports modes. 7-day battery life with always-on display.', 'Comprehensive health and fitness tracking watch', 2999.00, 3999.00, 4, 20, 1, 'WATCH001');

-- Insert product attributes
INSERT INTO product_attributes (product_id, attribute_name, attribute_value) VALUES 
(1, 'Color', 'Red'),
(1, 'Finish', 'Matte'),
(1, 'Weight', '15g'),
(2, 'Material', 'Genuine Leather'),
(2, 'Color', 'Brown'),
(2, 'Dimensions', '30x20x10 cm'),
(3, 'Material', 'Silver Plated'),
(3, 'Stone Type', 'Crystal'),
(3, 'Adjustable', 'Yes'),
(4, 'Material', 'Stainless Steel'),
(4, 'Pieces', '5'),
(4, 'Dishwasher Safe', 'Yes');

-- Insert sample reviews
INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES 
(1, 1, 5, 'Amazing Lipstick!', 'This lipstick has amazing color payoff and stays on all day without drying my lips. Highly recommended!'),
(2, 1, 4, 'Good Quality Handbag', 'The leather quality is good and it has enough space for all my essentials. Would buy again.'),
(3, 1, 5, 'Beautiful Ring', 'The ring looks more expensive than it is. Perfect fit and the stones sparkle beautifully.'),
(4, 1, 5, 'Great Kitchen Set', 'These utensils are sturdy and well-made. The handles are comfortable to hold. Excellent value for money.');

-- Insert sample coupons
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_amount, valid_until, usage_limit) VALUES 
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 500.00, '2024-12-31', 1000),
('SUMMER25', 'Summer special discount', 'percentage', 25.00, 1000.00, '2024-08-31', 500),
('FREESHIP', 'Free shipping on all orders', 'fixed', 50.00, 500.00, '2024-12-31', NULL);

-- Create database views for reporting

-- Product summary view
CREATE VIEW product_summary AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.price,
    p.compare_price,
    p.stock_quantity,
    c.name as category_name,
    COUNT(r.id) as review_count,
    AVG(r.rating) as average_rating,
    p.view_count,
    p.is_featured,
    p.is_active
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN reviews r ON p.id = r.product_id AND r.is_approved = TRUE
GROUP BY p.id;

-- Sales summary view
CREATE VIEW sales_summary AS
SELECT 
    DATE(o.created_at) as sale_date,
    COUNT(o.id) as total_orders,
    SUM(o.final_amount) as total_sales,
    AVG(o.final_amount) as average_order_value,
    COUNT(DISTINCT o.user_id) as unique_customers
FROM orders o
WHERE o.status != 'cancelled'
GROUP BY DATE(o.created_at);

-- Inventory alert view
CREATE VIEW inventory_alerts AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock_quantity,
    p.low_stock_threshold,
    c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.stock_quantity <= p.low_stock_threshold
AND p.is_active = TRUE;

-- Create stored procedures

-- Procedure to update product stock
DELIMITER //
CREATE PROCEDURE UpdateProductStock(
    IN p_product_id INT,
    IN p_quantity_change INT,
    IN p_change_type ENUM('sale', 'restock', 'adjustment', 'return'),
    IN p_reference_id INT,
    IN p_notes TEXT,
    IN p_created_by INT
)
BEGIN
    DECLARE old_stock INT;
    DECLARE new_stock INT;
    
    SELECT stock_quantity INTO old_stock FROM products WHERE id = p_product_id;
    
    SET new_stock = old_stock + p_quantity_change;
    IF new_stock < 0 THEN
        SET new_stock = 0;
    END IF;
    
    UPDATE products SET stock_quantity = new_stock WHERE id = p_product_id;
    
    INSERT INTO inventory_log (product_id, old_stock, new_stock, change_type, reference_id, notes, created_by)
    VALUES (p_product_id, old_stock, new_stock, p_change_type, p_reference_id, p_notes, p_created_by);
END //
DELIMITER ;

-- Procedure to create order
DELIMITER //
CREATE PROCEDURE CreateOrder(
    IN p_user_id INT,
    IN p_total_amount DECIMAL(10,2),
    IN p_shipping_amount DECIMAL(10,2),
    IN p_tax_amount DECIMAL(10,2),
    IN p_discount_amount DECIMAL(10,2),
    IN p_final_amount DECIMAL(10,2),
    IN p_payment_method ENUM('cod', 'card', 'upi', 'netbanking'),
    IN p_shipping_address TEXT,
    IN p_billing_address TEXT,
    IN p_customer_notes TEXT
)
BEGIN
    DECLARE order_number VARCHAR(50);
    DECLARE new_order_id INT;
    
    SET order_number = CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));
    
    INSERT INTO orders (user_id, order_number, total_amount, shipping_amount, tax_amount, discount_amount, final_amount, payment_method, shipping_address, billing_address, customer_notes)
    VALUES (p_user_id, order_number, p_total_amount, p_shipping_amount, p_tax_amount, p_discount_amount, p_final_amount, p_payment_method, p_shipping_address, p_billing_address, p_customer_notes);
    
    SET new_order_id = LAST_INSERT_ID();
    
    SELECT new_order_id as order_id, order_number;
END //
DELIMITER ;

-- Create triggers

-- Trigger to update product view count
DELIMITER //
CREATE TRIGGER after_product_view_insert
AFTER INSERT ON product_views
FOR EACH ROW
BEGIN
    UPDATE products 
    SET view_count = view_count + 1 
    WHERE id = NEW.product_id;
END //
DELIMITER ;

-- Trigger to update coupon usage count
DELIMITER //
CREATE TRIGGER after_coupon_usage
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
        -- This would typically update coupon usage count
        -- Implementation depends on how coupons are tracked in orders
        NULL;
    END IF;
END //
DELIMITER ;

-- Create database user for application
CREATE USER IF NOT EXISTS 'openmart_user'@'localhost' IDENTIFIED BY 'openmart_password123';
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE ON openmart.* TO 'openmart_user'@'localhost';
FLUSH PRIVILEGES;

-- Display completion message
SELECT 'OpenMart database setup completed successfully!' as message;