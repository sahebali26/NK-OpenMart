<?php
require_once 'config/database.php';

class Cart {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function addToCart($user_id, $product_id, $quantity = 1) {
        try {
            // Check if item already in cart
            $query = "SELECT * FROM cart WHERE user_id = :user_id AND product_id = :product_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":product_id", $product_id);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                // Update quantity
                $query = "UPDATE cart SET quantity = quantity + :quantity, updated_at = CURRENT_TIMESTAMP 
                          WHERE user_id = :user_id AND product_id = :product_id";
            } else {
                // Insert new item
                $query = "INSERT INTO cart (user_id, product_id, quantity) 
                          VALUES (:user_id, :product_id, :quantity)";
            }
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":product_id", $product_id);
            $stmt->bindParam(":quantity", $quantity);
            
            return $stmt->execute();
        } catch(PDOException $e) {
            return false;
        }
    }
    
    public function getCart($user_id) {
        try {
            $query = "SELECT c.*, p.name, p.price, p.compare_price, p.image, p.stock_quantity, 
                             (p.price * c.quantity) as item_total
                      FROM cart c 
                      JOIN products p ON c.product_id = p.id 
                      WHERE c.user_id = :user_id AND p.is_active = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return [];
        }
    }
    
    public function updateCartItem($user_id, $product_id, $quantity) {
        try {
            if($quantity <= 0) {
                return $this->removeFromCart($user_id, $product_id);
            }
            
            $query = "UPDATE cart SET quantity = :quantity, updated_at = CURRENT_TIMESTAMP 
                      WHERE user_id = :user_id AND product_id = :product_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":product_id", $product_id);
            $stmt->bindParam(":quantity", $quantity);
            
            return $stmt->execute();
        } catch(PDOException $e) {
            return false;
        }
    }
    
    public function removeFromCart($user_id, $product_id) {
        try {
            $query = "DELETE FROM cart WHERE user_id = :user_id AND product_id = :product_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":product_id", $product_id);
            
            return $stmt->execute();
        } catch(PDOException $e) {
            return false;
        }
    }
    
    public function clearCart($user_id) {
        try {
            $query = "DELETE FROM cart WHERE user_id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            
            return $stmt->execute();
        } catch(PDOException $e) {
            return false;
        }
    }
    
    public function getCartCount($user_id) {
        try {
            $query = "SELECT SUM(quantity) as total FROM cart c 
                      JOIN products p ON c.product_id = p.id 
                      WHERE c.user_id = :user_id AND p.is_active = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result['total'] ?? 0;
        } catch(PDOException $e) {
            return 0;
        }
    }
    
    public function getCartTotal($user_id) {
        try {
            $query = "SELECT SUM(p.price * c.quantity) as total 
                      FROM cart c 
                      JOIN products p ON c.product_id = p.id 
                      WHERE c.user_id = :user_id AND p.is_active = 1";
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