<?php
require_once 'config/database.php';

class Wishlist {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function addToWishlist($user_id, $product_id) {
        try {
            // Check if already in wishlist
            $query = "SELECT id FROM wishlist WHERE user_id = :user_id AND product_id = :product_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":product_id", $product_id);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                return true; // Already in wishlist
            }
            
            // Add to wishlist
            $query = "INSERT INTO wishlist (user_id, product_id) VALUES (:user_id, :product_id)";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":product_id", $product_id);
            
            return $stmt->execute();
        } catch(PDOException $e) {
            return false;
        }
    }
    
    public function removeFromWishlist($user_id, $product_id) {
        try {
            $query = "DELETE FROM wishlist WHERE user_id = :user_id AND product_id = :product_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":product_id", $product_id);
            
            return $stmt->execute();
        } catch(PDOException $e) {
            return false;
        }
    }
    
    public function getWishlist($user_id) {
        try {
            $query = "SELECT w.*, p.name, p.price, p.compare_price, p.image, p.stock_quantity 
                      FROM wishlist w 
                      JOIN products p ON w.product_id = p.id 
                      WHERE w.user_id = :user_id AND p.is_active = 1 
                      ORDER BY w.created_at DESC";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return [];
        }
    }
    
    public function isInWishlist($user_id, $product_id) {
        try {
            $query = "SELECT id FROM wishlist WHERE user_id = :user_id AND product_id = :product_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":product_id", $product_id);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch(PDOException $e) {
            return false;
        }
    }
    
    public function getWishlistCount($user_id) {
        try {
            $query = "SELECT COUNT(*) as total FROM wishlist w 
                      JOIN products p ON w.product_id = p.id 
                      WHERE w.user_id = :user_id AND p.is_active = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['total'] ?? 0;
        } catch(PDOException $e) {
            return 0;
        }
    }
}
?>