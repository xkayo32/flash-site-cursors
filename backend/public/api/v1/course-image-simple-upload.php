<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

if (!isset($_FILES['thumbnail']) || $_FILES['thumbnail']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'No file uploaded or upload error.']);
    exit;
}

$image_type = exif_imagetype($_FILES['thumbnail']['tmp_name']);
if (!in_array($image_type, [IMAGETYPE_JPEG, IMAGETYPE_PNG])) {
    echo json_encode(['status' => 'error', 'message' => 'Only JPG and PNG images are allowed.']);
    exit;
}

$max_size = 10 * 1024 * 1024; // 10MB
if ($_FILES['thumbnail']['size'] > $max_size) {
    echo json_encode(['status' => 'error', 'message' => 'File size exceeds 10MB.']);
    exit;
}

// Get course ID and username from POST data
$courseId = $_POST['course_id'] ?? 'unknown';
$username = $_POST['username'] ?? 'admin';

// Create directory if it doesn't exist
$uploadDir = __DIR__ . '/../../images/';
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to create upload directory.']);
        exit;
    }
}

// Create filename: username_course + random_hash + datetime.png
$datetime = date('Y-m-d_H-i-s');
$randomHash = uniqid();
$filename = $username . '_course' . $courseId . '_' . $randomHash . '_' . $datetime . '.png';

$destination = $uploadDir . $filename;

if ($image_type == IMAGETYPE_JPEG) {
    $src_image = imagecreatefromjpeg($_FILES['thumbnail']['tmp_name']);
} elseif ($image_type == IMAGETYPE_PNG) {
    $src_image = imagecreatefrompng($_FILES['thumbnail']['tmp_name']);
}

if (!$src_image) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to create image resource.']);
    exit;
}

$src_width = imagesx($src_image);
$src_height = imagesy($src_image);
$dst_width = 400;
$dst_height = 300;
$dst_image = imagecreatetruecolor($dst_width, $dst_height);
imagecopyresampled($dst_image, $src_image, 0, 0, 0, 0, $dst_width, $dst_height, $src_width, $src_height);

if (!imagepng($dst_image, $destination)) {
    imagedestroy($src_image);
    imagedestroy($dst_image);
    echo json_encode(['status' => 'error', 'message' => 'Failed to save image.']);
    exit;
}

imagedestroy($src_image);
imagedestroy($dst_image);

// Update course thumbnail URL in database
try {
    // PostgreSQL connection
    $host = getenv('DB_HOST') ?: 'postgres';
    $port = getenv('DB_PORT') ?: '5432';
    $dbname = getenv('DB_NAME') ?: 'estudos_db';
    $user = getenv('DB_USER') ?: 'estudos_user';
    $pass = getenv('DB_PASS') ?: 'estudos_pass';
    
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    $thumbnailUrl = '/images/' . $filename;
    
    $stmt = $pdo->prepare("UPDATE courses SET thumbnail_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $stmt->execute([$thumbnailUrl, $courseId]);
    
} catch (Exception $e) {
    error_log('Database error in course image upload: ' . $e->getMessage());
    // Don't fail the whole request if DB update fails - image is still uploaded
}

echo json_encode([
    'status' => 'success', 
    'image_url' => '/images/' . $filename,
    'filename' => $filename,
    'message' => 'Image uploaded successfully'
]);
?>