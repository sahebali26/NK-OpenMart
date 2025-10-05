<?php
require_once 'config/database.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Create tables
    $sql = "
    SET FOREIGN_KEY_CHECKS=0;
    
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
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
        gallery TEXT,
        stock_quantity INT DEFAULT 0,
        low_stock_threshold INT DEFAULT 5,
        is_featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        weight DECIMAL(8,2),
        dimensions VARCHAR(100),
        meta_title VARCHAR(255),
        meta_description TEXT,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
    
    CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_cart_item (user_id, product_id)
    );
    
    CREATE TABLE IF NOT EXISTS wishlist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_wishlist_item (user_id, product_id)
    );
    
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
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    
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
        UNIQUE KEY unique_product_review (product_id, user_id)
    );
    
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    SET FOREIGN_KEY_CHECKS=1;
    ";
    
    $conn->exec($sql);
    
    // Insert admin user
    $password = password_hash('admin123', PASSWORD_DEFAULT);
    $admin_sql = "INSERT IGNORE INTO users (name, email, password, role) VALUES 
                 ('Admin User', 'admin@openmart.com', '$password', 'admin')";
    $conn->exec($admin_sql);
    
    // Insert sample categories
    $categories_sql = "INSERT IGNORE INTO categories (name, slug, description) VALUES 
                      ('Cosmetics', 'cosmetics', 'Beauty and cosmetic products for daily care and special occasions'),
                      ('Ladies Products', 'ladies-products', 'Exclusive products designed for women including fashion and accessories'),
                      ('Daily Uses', 'daily-uses', 'Essential everyday products for household and personal care'),
                      ('Electronics', 'electronics', 'Latest gadgets and electronic devices'),
                      ('Fashion', 'fashion', 'Trendy clothing and fashion accessories')";
    $conn->exec($categories_sql);
    
    // Insert sample products
    $products_sql = "INSERT IGNORE INTO products (name, slug, description, short_description, price, compare_price, category_id, stock_quantity, is_featured, sku) VALUES 
                    ('Premium Matte Lipstick', 'premium-matte-lipstick', 'Long-lasting matte lipstick with rich color payoff. Waterproof and transfer-proof formula.', 'Rich color matte lipstick', 499.00, 599.00, 1, 50, 1, 'LIP001'),
                    ('Designer Leather Handbag', 'designer-leather-handbag', 'Genuine leather handbag with multiple compartments. Perfect for daily use or special occasions.', 'Genuine leather handbag', 1299.00, 1599.00, 2, 25, 1, 'BAG001'),
                    ('Silver Plated Ring', 'silver-plated-ring', 'Elegant silver plated ring with crystal stones. Adjustable size for perfect fit.', 'Elegant silver ring', 699.00, 899.00, 2, 100, 0, 'RING001'),
                    ('5-Piece Kitchen Utensil Set', 'kitchen-utensil-set', 'Stainless steel kitchen utensil set including spatula, ladle, spoon, and more. Ergonomic handles.', 'Complete kitchen tool set', 799.00, 999.00, 3, 30, 1, 'KIT001'),
                    ('Organic Face Cream', 'organic-face-cream', '100% organic face cream with aloe vera and vitamin E. Suitable for all skin types.', 'Natural face moisturizer', 349.00, 449.00, 1, 75, 0, 'CRM001'),
                    ('Wireless Earbuds', 'wireless-earbuds', 'Bluetooth 5.0 wireless earbuds with charging case. 20 hours battery life with noise cancellation.', 'High-quality audio earbuds', 1599.00, 1999.00, 4, 40, 1, 'EAR001'),
                    ('Cotton T-Shirt Pack', 'cotton-tshirt-pack', 'Pack of 3 premium cotton t-shirts. Available in multiple colors. Machine washable.', 'Comfortable cotton t-shirts', 899.00, 1099.00, 5, 60, 0, 'TSH001')";
    $conn->exec($products_sql);
    
    echo "<!DOCTYPE html>
    <html lang='en'>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>OpenMart Installation</title>
        <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css' rel='stylesheet'>
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; }
            .installation-card { background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='row justify-content-center'>
                <div class='col-md-8'>
                    <div class='installation-card p-5 my-5'>
                        <div class='text-center mb-4'>
                            <h1 class='text-primary'><i class='fas fa-shopping-cart'></i> OpenMart</h1>
                            <p class='lead'>E-commerce Platform Installation</p>
                        </div>
                        
                        <div class='alert alert-success'>
                            <h4><i class='fas fa-check-circle'></i> Installation Successful!</h4>
                            <p>Database tables created successfully with sample data.</p>
                        </div>
                        
                        <div class='row mt-4'>
                            <div class='col-md-6'>
                                <div class='card'>
                                    <div class='card-body'>
                                        <h5>Admin Access</h5>
                                        <p><strong>Email:</strong> admin@openmart.com</p>
                                        <p><strong>Password:</strong> admin123</p>
                                        <a href='admin/dashboard.html' class='btn btn-primary btn-sm'>Go to Admin Panel</a>
                                    </div>
                                </div>
                            </div>
                            <div class='col-md-6'>
                                <div class='card'>
                                    <div class='card-body'>
                                        <h5>Website</h5>
                                        <p>Explore the frontend of your new e-commerce store</p>
                                        <a href='index.html' class='btn btn-outline-primary btn-sm'>Visit Website</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class='alert alert-warning mt-4'>
                            <h6><i class='fas fa-exclamation-triangle'></i> Security Notice</h6>
                            <p class='mb-0'>For security reasons, please delete or rename the <code>install.php</code> file after installation.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script src='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js'></script>
    </body>
    </html>";
    
} catch(PDOException $e) {
    echo "<div class='alert alert-danger'>Installation failed: " . $e->getMessage() . "</div>";
}
?>