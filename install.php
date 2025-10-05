<?php
// OpenMart Installation Script
// This script will set up the complete database and initial data

// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if already installed
if (file_exists('config/database.php') && !isset($_GET['force'])) {
    die('
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OpenMart - Already Installed</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; }
            .installation-card { background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="installation-card p-5 my-5 text-center">
                        <div class="mb-4">
                            <i class="fas fa-check-circle fa-5x text-success"></i>
                        </div>
                        <h2 class="text-primary">OpenMart Already Installed</h2>
                        <p class="lead">Your OpenMart e-commerce platform is already set up and ready to use.</p>
                        <div class="mt-4">
                            <a href="index.html" class="btn btn-primary me-2">Visit Website</a>
                            <a href="admin/dashboard.html" class="btn btn-outline-primary me-2">Admin Panel</a>
                            <a href="install.php?force=1" class="btn btn-warning">Reinstall</a>
                        </div>
                        <div class="alert alert-warning mt-4">
                            <strong>Warning:</strong> Reinstalling will reset your database and delete all existing data.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    ');
}

// Installation form handler
if ($_POST['install'] ?? false) {
    $db_host = $_POST['db_host'] ?? 'localhost';
    $db_name = $_POST['db_name'] ?? 'openmart';
    $db_user = $_POST['db_user'] ?? 'root';
    $db_pass = $_POST['db_pass'] ?? '';
    $admin_email = $_POST['admin_email'] ?? 'admin@openmart.com';
    $admin_password = $_POST['admin_password'] ?? 'admin123';
    
    try {
        // Test database connection
        $pdo = new PDO("mysql:host=$db_host", $db_user, $db_pass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Create database if not exists
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name`");
        $pdo->exec("USE `$db_name`");
        
        // Read and execute SQL setup file
        $sql_file = 'database/setup.sql';
        if (!file_exists($sql_file)) {
            throw new Exception("Database setup file not found: $sql_file");
        }
        
        $sql = file_get_contents($sql_file);
        $pdo->exec($sql);
        
        // Update admin user with provided credentials
        $hashed_password = password_hash($admin_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE users SET email = ?, password = ? WHERE role = 'admin' LIMIT 1");
        $stmt->execute([$admin_email, $hashed_password]);
        
        // Update database configuration
        $config_content = '<?php
class Database {
    private $host = "' . $db_host . '";
    private $db_name = "' . $db_name . '";
    private $username = "' . $db_user . '";
    private $password = "' . $db_pass . '";
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
        
        file_put_contents('config/database.php', $config_content);
        
        // Create installed flag file
        file_put_contents('config/installed.flag', date('Y-m-d H:i:s'));
        
        // Show success message
        showSuccess($admin_email, $admin_password);
        
    } catch (Exception $e) {
        showError($e->getMessage());
    }
    
    exit;
}

// Show installation form
showInstallationForm();

function showInstallationForm() {
    echo '
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OpenMart Installation</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; }
            .installation-card { background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .step-indicator { display: flex; justify-content: space-between; margin-bottom: 2rem; }
            .step { flex: 1; text-align: center; padding: 10px; position: relative; }
            .step.active .step-number { background: #4e73df; color: white; }
            .step-number { width: 40px; height: 40px; border-radius: 50%; background: #e9ecef; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="installation-card p-4 p-md-5 my-5">
                        <div class="text-center mb-4">
                            <h1 class="text-primary"><i class="fas fa-shopping-cart"></i> OpenMart</h1>
                            <p class="lead">E-commerce Platform Installation</p>
                        </div>
                        
                        <div class="step-indicator">
                            <div class="step active">
                                <div class="step-number">1</div>
                                <div>Database</div>
                            </div>
                            <div class="step">
                                <div class="step-number">2</div>
                                <div>Admin</div>
                            </div>
                            <div class="step">
                                <div class="step-number">3</div>
                                <div>Complete</div>
                            </div>
                        </div>
                        
                        <form method="POST" id="installForm">
                            <input type="hidden" name="install" value="1">
                            
                            <h4 class="mb-3">Database Configuration</h4>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="db_host" class="form-label">Database Host *</label>
                                    <input type="text" class="form-control" id="db_host" name="db_host" value="localhost" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="db_name" class="form-label">Database Name *</label>
                                    <input type="text" class="form-control" id="db_name" name="db_name" value="openmart" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="db_user" class="form-label">Database Username *</label>
                                    <input type="text" class="form-control" id="db_user" name="db_user" value="root" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="db_pass" class="form-label">Database Password</label>
                                    <input type="password" class="form-control" id="db_pass" name="db_pass">
                                </div>
                            </div>
                            
                            <hr class="my-4">
                            
                            <h4 class="mb-3">Admin Account</h4>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="admin_email" class="form-label">Admin Email *</label>
                                    <input type="email" class="form-control" id="admin_email" name="admin_email" value="admin@openmart.com" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="admin_password" class="form-label">Admin Password *</label>
                                    <input type="password" class="form-control" id="admin_password" name="admin_password" value="admin123" required>
                                    <div class="form-text">Minimum 6 characters</div>
                                </div>
                            </div>
                            
                            <div class="alert alert-info">
                                <h6><i class="fas fa-info-circle"></i> System Requirements</h6>
                                <ul class="mb-0">
                                    <li>PHP 7.4 or higher</li>
                                    <li>MySQL 5.7 or higher</li>
                                    <li>PDO MySQL Extension</li>
                                    <li>GD Library for image processing</li>
                                </ul>
                            </div>
                            
                            <div class="mt-4">
                                <button type="submit" class="btn btn-primary btn-lg w-100">
                                    <i class="fas fa-download me-2"></i>Install OpenMart
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>';
}

function showSuccess($admin_email, $admin_password) {
    echo '
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OpenMart - Installation Successful</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; }
            .installation-card { background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-8">
                    <div class="installation-card p-5 my-5">
                        <div class="text-center mb-4">
                            <i class="fas fa-check-circle fa-5x text-success mb-3"></i>
                            <h1 class="text-primary">Installation Successful!</h1>
                            <p class="lead">Your OpenMart e-commerce platform is ready to use.</p>
                        </div>
                        
                        <div class="alert alert-success">
                            <h4><i class="fas fa-check-circle"></i> Setup Completed</h4>
                            <p>Database tables created successfully with sample data.</p>
                        </div>
                        
                        <div class="row mt-4">
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-body text-center">
                                        <h5 class="card-title">Admin Access</h5>
                                        <div class="mb-3">
                                            <strong>Email:</strong> ' . htmlspecialchars($admin_email) . '<br>
                                            <strong>Password:</strong> ' . htmlspecialchars($admin_password) . '
                                        </div>
                                        <a href="admin/dashboard.html" class="btn btn-primary">Go to Admin Panel</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card h-100">
                                    <div class="card-body text-center">
                                        <h5 class="card-title">Website</h5>
                                        <p class="card-text">Explore the frontend of your new e-commerce store</p>
                                        <a href="index.html" class="btn btn-outline-primary">Visit Website</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-warning mt-4">
                            <h6><i class="fas fa-exclamation-triangle"></i> Security Notice</h6>
                            <p class="mb-0">
                                <strong>Important:</strong> For security reasons, please delete or rename the <code>install.php</code> file after installation.
                            </p>
                        </div>
                        
                        <div class="mt-4">
                            <h5>Next Steps:</h5>
                            <ol>
                                <li>Configure your payment gateway in admin panel</li>
                                <li>Set up shipping methods and rates</li>
                                <li>Add your products and categories</li>
                                <li>Configure email settings for notifications</li>
                                <li>Test the complete checkout process</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>';
}

function showError($message) {
    echo '
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OpenMart - Installation Error</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        <style>
            body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; }
            .installation-card { background: white; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6">
                    <div class="installation-card p-5 my-5 text-center">
                        <div class="mb-4">
                            <i class="fas fa-exclamation-triangle fa-5x text-danger"></i>
                        </div>
                        <h2 class="text-danger">Installation Failed</h2>
                        <div class="alert alert-danger mt-3">
                            <strong>Error:</strong> ' . htmlspecialchars($message) . '
                        </div>
                        <p class="mt-3">Please check your database credentials and try again.</p>
                        <div class="mt-4">
                            <a href="install.php" class="btn btn-primary">Try Again</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>';
}
?>