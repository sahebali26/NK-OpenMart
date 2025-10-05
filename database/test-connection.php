<?php
// Database connection test script
require_once '../config/database.php';

try {
    $database = new Database();
    $conn = $database->getConnection();
    
    if ($conn) {
        echo "✅ Database connection successful!\n";
        
        // Test basic queries
        $query = "SELECT COUNT(*) as user_count FROM users";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "✅ Users table accessible. Total users: " . $result['user_count'] . "\n";
        
        // Test products count
        $query = "SELECT COUNT(*) as product_count FROM products";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "✅ Products table accessible. Total products: " . $result['product_count'] . "\n";
        
        // Test categories count
        $query = "SELECT COUNT(*) as category_count FROM categories";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "✅ Categories table accessible. Total categories: " . $result['category_count'] . "\n";
        
        echo "\n🎉 All database tests passed! OpenMart database is ready.\n";
        
    } else {
        echo "❌ Database connection failed!\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
?>