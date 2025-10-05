<?php
require_once 'config/database.php';

class Order {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function createOrder($user_id, $order_data) {
        try {
            $this->conn->beginTransaction();
            
            // Generate order number
            $order_number = 'ORD' . date('Ymd') . strtoupper(substr(uniqid(), -6));
            
            // Create order
            $query = "INSERT INTO orders (user_id, order_number, total_amount, shipping_amount, tax_amount, 
                                         discount_amount, final_amount, payment_method, payment_status, 
                                         shipping_address, billing_address, customer_notes) 
                      VALUES (:user_id, :order_number, :total_amount, :shipping_amount, :tax_amount, 
                              :discount_amount, :final_amount, :payment_method, :payment_status, 
                              :shipping_address, :billing_address, :customer_notes)";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':user_id' => $user_id,
                ':order_number' => $order_number,
                ':total_amount' => $order_data['total_amount'],
                ':shipping_amount' => $order_data['shipping_amount'],
                ':tax_amount' => $order_data['tax_amount'],
                ':discount_amount' => $order_data['discount_amount'],
                ':final_amount' => $order_data['final_amount'],
                ':payment_method' => $order_data['payment_method'],
                ':payment_status' => $order_data['payment_status'],
                ':shipping_address' => $order_data['shipping_address'],
                ':billing_address' => $order_data['billing_address'],
                ':customer_notes' => $order_data['customer_notes'] ?? ''
            ]);
            
            $order_id = $this->conn->lastInsertId();
            
            // Add order items
            foreach($order_data['items'] as $item) {
                $query = "INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity, total_price) 
                          VALUES (:order_id, :product_id, :product_name, :product_price, :quantity, :total_price)";
                
                $stmt = $this->conn->prepare($query);
                $stmt->execute([
                    ':order_id' => $order_id,
                    ':product_id' => $item['product_id'],
                    ':product_name' => $item['product_name'],
                    ':product_price' => $item['product_price'],
                    ':quantity' => $item['quantity'],
                    ':total_price' => $item['total_price']
                ]);
                
                // Update product stock
                $query = "UPDATE products SET stock_quantity = stock_quantity - :quantity WHERE id = :product_id";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([
                    ':quantity' => $item['quantity'],
                    ':product_id' => $item['product_id']
                ]);
            }
            
            $this->conn->commit();
            return $order_id;
            
        } catch(PDOException $e) {
            $this->conn->rollBack();
            return false;
        }
    }
    
    public function getOrders($user_id = null, $limit = null, $offset = 0) {
        try {
            $query = "SELECT o.*, u.name as customer_name 
                      FROM orders o 
                      LEFT JOIN users u ON o.user_id = u.id 
                      WHERE 1=1";
            
            $params = [];
            
            if($user_id) {
                $query .= " AND o.user_id = :user_id";
                $params[':user_id'] = $user_id;
            }
            
            $query .= " ORDER BY o.created_at DESC";
            
            if($limit) {
                $query .= " LIMIT :offset, :limit";
                $params[':offset'] = $offset;
                $params[':limit'] = $limit;
            }
            
            $stmt = $this->conn->prepare($query);
            
            foreach($params as $key => $value) {
                if($key === ':offset' || $key === ':limit') {
                    $stmt->bindValue($key, (int)$value, PDO::PARAM_INT);
                } else {
                    $stmt->bindValue($key, $value);
                }
            }
            
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return [];
        }
    }
    
    public function getOrder($order_id, $user_id = null) {
        try {
            $query = "SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone 
                      FROM orders o 
                      LEFT JOIN users u ON o.user_id = u.id 
                      WHERE o.id = :order_id";
            
            $params = [':order_id' => $order_id];
            
            if($user_id) {
                $query .= " AND o.user_id = :user_id";
                $params[':user_id'] = $user_id;
            }
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if($order) {
                $order['items'] = $this->getOrderItems($order_id);
            }
            
            return $order;
        } catch(PDOException $e) {
            return null;
        }
    }
    
    public function getOrderItems($order_id) {
        try {
            $query = "SELECT oi.*, p.image 
                      FROM order_items oi 
                      LEFT JOIN products p ON oi.product_id = p.id 
                      WHERE oi.order_id = :order_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":order_id", $order_id);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return [];
        }
    }
    
    public function updateOrderStatus($order_id, $status, $admin_notes = '') {
        try {
            $query = "UPDATE orders SET status = :status, admin_notes = :admin_notes, updated_at = CURRENT_TIMESTAMP 
                      WHERE id = :order_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":admin_notes", $admin_notes);
            $stmt->bindParam(":order_id", $order_id);
            
            return $stmt->execute();
        } catch(PDOException $e) {
            return false;
        }
    }
    
    public function getOrdersCount($user_id = null) {
        try {
            $query = "SELECT COUNT(*) as total FROM orders";
            
            if($user_id) {
                $query .= " WHERE user_id = :user_id";
            }
            
            $stmt = $this->conn->prepare($query);
            
            if($user_id) {
                $stmt->bindParam(":user_id", $user_id);
            }
            
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['total'] ?? 0;
        } catch(PDOException $e) {
            return 0;
        }
    }
    
    public function getSalesStats() {
        try {
            $query = "SELECT 
                         COUNT(*) as total_orders,
                         SUM(final_amount) as total_sales,
                         AVG(final_amount) as average_order_value,
                         COUNT(DISTINCT user_id) as total_customers
                      FROM orders 
                      WHERE status != 'cancelled'";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return [];
        }
    }
}
?>