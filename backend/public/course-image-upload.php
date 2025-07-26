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

// Create filename: username_course + random_hash + datetime.png
$datetime = date('Y-m-d_H-i-s');
$randomHash = uniqid();
$filename = $username . '_course' . $courseId . '_' . $randomHash . '_' . $datetime . '.png';

$destination = __DIR__ . '/images/' . $filename;

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

echo json_encode([
    'status' => 'success', 
    'image_url' => '/images/' . $filename,
    'filename' => $filename,
    'message' => 'Image uploaded successfully'
]);
?>