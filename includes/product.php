<?php
require_once 'config/database.php';

class Product {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function getProducts($category_id = null, $featured = false, $limit = null, $offset = 0) {
        try {
            $query = "SELECT p.*, c.name as category_name 
                      FROM products p 
                      LEFT JOIN categories c ON p.category_id = c.id 
                      WHERE p.is_active = 1";
            
            $params = [];
            
            if($category_id) {
                $query .= " AND p.category_id = :category_id";
                $params[':category_id'] = $category_id;
            }
            
            if($featured) {
                $query .= " AND p.is_featured = 1";
            }
            
            $query .= " ORDER BY p.created_at DESC";
            
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
    
    public function getProduct($id) {
        try {
            $query = "SELECT p.*, c.name as category_name 
                      FROM products p 
                      LEFT JOIN categories c ON p.category_id = c.id 
                      WHERE p.id = :id AND p.is_active = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return null;
        }
    }
    
    public function getProductBySlug($slug) {
        try {
            $query = "SELECT p.*, c.name as category_name 
                      FROM products p 
                      LEFT JOIN categories c ON p.category_id = c.id 
                      WHERE p.slug = :slug AND p.is_active = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":slug", $slug);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return null;
        }
    }
    
    public function searchProducts($search_term, $category_id = null, $min_price = null, $max_price = null, $sort = 'newest') {
        try {
            $query = "SELECT p.*, c.name as category_name 
                      FROM products p 
                      LEFT JOIN categories c ON p.category_id = c.id 
                      WHERE p.is_active = 1 AND (p.name LIKE :search OR p.description LIKE :search OR p.tags LIKE :search)";
            
            $params = [':search' => "%$search_term%"];
            
            if($category_id) {
                $query .= " AND p.category_id = :category_id";
                $params[':category_id'] = $category_id;
            }
            
            if($min_price !== null) {
                $query .= " AND p.price >= :min_price";
                $params[':min_price'] = $min_price;
            }
            
            if($max_price !== null) {
                $query .= " AND p.price <= :max_price";
                $params[':max_price'] = $max_price;
            }
            
            // Sorting
            switch($sort) {
                case 'price_low':
                    $query .= " ORDER BY p.price ASC";
                    break;
                case 'price_high':
                    $query .= " ORDER BY p.price DESC";
                    break;
                case 'name':
                    $query .= " ORDER BY p.name ASC";
                    break;
                case 'featured':
                    $query .= " ORDER BY p.is_featured DESC, p.created_at DESC";
                    break;
                default:
                    $query .= " ORDER BY p.created_at DESC";
            }
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return [];
        }
    }
    
    public function getCategories() {
        try {
            $query = "SELECT * FROM categories WHERE is_active = 1 ORDER BY name";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return [];
        }
    }
    
    public function getCategory($id) {
        try {
            $query = "SELECT * FROM categories WHERE id = :id AND is_active = 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return null;
        }
    }
    
    public function getProductsCount($category_id = null) {
        try {
            $query = "SELECT COUNT(*) as total FROM products WHERE is_active = 1";
            
            if($category_id) {
                $query .= " AND category_id = :category_id";
            }
            
            $stmt = $this->conn->prepare($query);
            
            if($category_id) {
                $stmt->bindParam(":category_id", $category_id);
            }
            
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['total'] ?? 0;
        } catch(PDOException $e) {
            return 0;
        }
    }
    
    // Admin methods
    public function getAllProducts($limit = null, $offset = 0) {
        try {
            $query = "SELECT p.*, c.name as category_name 
                      FROM products p 
                      LEFT JOIN categories c ON p.category_id = c.id 
                      WHERE 1=1";
            
            if($limit) {
                $query .= " LIMIT :offset, :limit";
            }
            
            $stmt = $this->conn->prepare($query);
            
            if($limit) {
                $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
                $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
            }
            
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return [];
        }
    }
    
    public function createProduct($data) {
        try {
            $query = "INSERT INTO products SET 
                     name=:name, slug=:slug, description=:description, short_description=:short_description,
                     price=:price, compare_price=:compare_price, category_id=:category_id, stock_quantity=:stock_quantity,
                     sku=:sku, is_featured=:is_featured, is_active=:is_active";
            
            $stmt = $this->conn->prepare($query);
            
            return $stmt->execute($data);
        } catch(PDOException $e) {
            return false;
        }
    }
    
    public function updateProduct($id, $data) {
        try {
            $query = "UPDATE products SET 
                     name=:name, slug=:slug, description=:description, short_description=:short_description,
                     price=:price, compare_price=:compare_price, category_id=:category_id, stock_quantity=:stock_quantity,
                     sku=:sku, is_featured=:is_featured, is_active=:is_active, updated_at=CURRENT_TIMESTAMP
                     WHERE id=:id";
            
            $data[':id'] = $id;
            $stmt = $this->conn->prepare($query);
            
            return $stmt->execute($data);
        } catch(PDOException $e) {
            return false;
        }
    }
    
    public function deleteProduct($id) {
        try {
            $query = "DELETE FROM products WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            
            return $stmt->execute();
        } catch(PDOException $e) {
            return false;
        }
    }
}
?>