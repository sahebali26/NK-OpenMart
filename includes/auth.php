<?php
require_once 'config/database.php';

class Auth {
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    public function register($name, $email, $password, $phone = '', $address = '') {
        try {
            // Check if email already exists
            $query = "SELECT id FROM users WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $email);
            $stmt->execute();
            
            if($stmt->rowCount() > 0) {
                return array("success" => false, "message" => "Email already exists");
            }
            
            // Insert new user
            $query = "INSERT INTO users SET name=:name, email=:email, password=:password, phone=:phone, address=:address";
            $stmt = $this->conn->prepare($query);
            
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":password", $password_hash);
            $stmt->bindParam(":phone", $phone);
            $stmt->bindParam(":address", $address);
            
            if($stmt->execute()) {
                return array("success" => true, "message" => "Registration successful");
            }
            
            return array("success" => false, "message" => "Registration failed");
        } catch(PDOException $e) {
            return array("success" => false, "message" => "Database error: " . $e->getMessage());
        }
    }
    
    public function login($email, $password) {
        try {
            $query = "SELECT id, name, email, password, role, phone, address FROM users WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $email);
            $stmt->execute();
            
            if($stmt->rowCount() == 1) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if(password_verify($password, $row['password'])) {
                    $_SESSION['user_id'] = $row['id'];
                    $_SESSION['user_name'] = $row['name'];
                    $_SESSION['user_email'] = $row['email'];
                    $_SESSION['user_role'] = $row['role'];
                    $_SESSION['user_phone'] = $row['phone'];
                    $_SESSION['user_address'] = $row['address'];
                    
                    return array("success" => true, "message" => "Login successful", "user" => $row);
                }
            }
            
            return array("success" => false, "message" => "Invalid email or password");
        } catch(PDOException $e) {
            return array("success" => false, "message" => "Database error: " . $e->getMessage());
        }
    }
    
    public function getUser($user_id) {
        try {
            $query = "SELECT id, name, email, phone, address, city, state, zip_code, role, created_at FROM users WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $user_id);
            $stmt->execute();
            
            if($stmt->rowCount() == 1) {
                return $stmt->fetch(PDO::FETCH_ASSOC);
            }
            return null;
        } catch(PDOException $e) {
            return null;
        }
    }
    
    public function updateProfile($user_id, $name, $phone, $address, $city, $state, $zip_code) {
        try {
            $query = "UPDATE users SET name=:name, phone=:phone, address=:address, city=:city, state=:state, zip_code=:zip_code WHERE id=:id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":phone", $phone);
            $stmt->bindParam(":address", $address);
            $stmt->bindParam(":city", $city);
            $stmt->bindParam(":state", $state);
            $stmt->bindParam(":zip_code", $zip_code);
            $stmt->bindParam(":id", $user_id);
            
            if($stmt->execute()) {
                $_SESSION['user_name'] = $name;
                $_SESSION['user_phone'] = $phone;
                $_SESSION['user_address'] = $address;
                
                return array("success" => true, "message" => "Profile updated successfully");
            }
            
            return array("success" => false, "message" => "Profile update failed");
        } catch(PDOException $e) {
            return array("success" => false, "message" => "Database error: " . $e->getMessage());
        }
    }
}
?>