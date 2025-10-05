<?php
function generateOrderNumber() {
    return 'ORD' . date('YmdHis') . mt_rand(1000, 9999);
}

function formatDate($date, $format = 'd M Y') {
    return date($format, strtotime($date));
}

function getOrderStatusBadge($status) {
    $badges = [
        'pending' => 'bg-warning',
        'confirmed' => 'bg-info',
        'processing' => 'bg-primary',
        'shipped' => 'bg-secondary',
        'delivered' => 'bg-success',
        'cancelled' => 'bg-danger',
        'refunded' => 'bg-dark'
    ];
    
    return $badges[$status] ?? 'bg-secondary';
}

function getPaymentStatusBadge($status) {
    $badges = [
        'pending' => 'bg-warning',
        'paid' => 'bg-success',
        'failed' => 'bg-danger',
        'refunded' => 'bg-dark'
    ];
    
    return $badges[$status] ?? 'bg-secondary';
}

function uploadImage($file, $target_dir = "images/products/") {
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0777, true);
    }
    
    $target_file = $target_dir . basename($file["name"]);
    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
    
    // Check if image file is actual image
    $check = getimagesize($file["tmp_name"]);
    if($check === false) {
        return array("success" => false, "message" => "File is not an image.");
    }
    
    // Check file size (5MB max)
    if ($file["size"] > 5000000) {
        return array("success" => false, "message" => "File is too large.");
    }
    
    // Allow certain file formats
    $allowed_types = ["jpg", "jpeg", "png", "gif", "webp"];
    if(!in_array($imageFileType, $allowed_types)) {
        return array("success" => false, "message" => "Only JPG, JPEG, PNG & GIF files are allowed.");
    }
    
    // Generate unique filename
    $new_filename = uniqid() . '.' . $imageFileType;
    $target_file = $target_dir . $new_filename;
    
    if (move_uploaded_file($file["tmp_name"], $target_file)) {
        return array("success" => true, "filename" => $new_filename);
    } else {
        return array("success" => false, "message" => "Error uploading file.");
    }
}

function sendEmail($to, $subject, $message, $headers = '') {
    // Basic email function - in production, use PHPMailer or similar
    if(empty($headers)) {
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: no-reply@openmart.com" . "\r\n";
    }
    
    return mail($to, $subject, $message, $headers);
}

function calculateDiscount($price, $compare_price) {
    if($compare_price > $price) {
        return round((($compare_price - $price) / $compare_price) * 100);
    }
    return 0;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validatePhone($phone) {
    return preg_match('/^[0-9]{10}$/', $phone);
}

function getPagination($current_page, $total_items, $per_page) {
    $total_pages = ceil($total_items / $per_page);
    $prev_page = $current_page > 1 ? $current_page - 1 : null;
    $next_page = $current_page < $total_pages ? $current_page + 1 : null;
    
    return [
        'current_page' => $current_page,
        'total_pages' => $total_pages,
        'prev_page' => $prev_page,
        'next_page' => $next_page,
        'offset' => ($current_page - 1) * $per_page
    ];
}
?>