<?php
session_start();

// Site Configuration
define('SITE_NAME', 'OpenMart');
define('SITE_URL', 'http://localhost/openmart');
define('UPLOAD_PATH', 'images/products/');

// CSRF Protection
function generateCSRFToken() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function validateCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Authentication Functions
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function isAdmin() {
    return isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin';
}

function requireLogin() {
    if (!isLoggedIn()) {
        header("Location: ../login.html");
        exit();
    }
}

function requireAdmin() {
    if (!isAdmin()) {
        header("Location: ../index.html");
        exit();
    }
}

// Utility Functions
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function formatPrice($price) {
    return '₹' . number_format($price, 2);
}

function redirect($url) {
    header("Location: $url");
    exit();
}

function jsonResponse($success, $message = '', $data = []) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit();
}
?>