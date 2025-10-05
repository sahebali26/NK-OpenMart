<?php
// Database configuration update script
// Run this once after database setup

$config_content = '<?php
class Database {
    private $host = "localhost";
    private $db_name = "openmart";
    private $username = "openmart_user";
    private $password = "openmart_password123";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>';

file_put_contents('../config/database.php', $config_content);
echo "Database configuration updated successfully!\n";
?>